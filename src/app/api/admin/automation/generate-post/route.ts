import { requireAdmin } from "@/lib/admin-guard";
import { buildBroadcastPostPrompt, type BroadcastPostType } from "@/lib/broadcast-prompts";
import {
  callModelWithRotation,
  getEarliestRetryAfterSeconds,
  isProviderConfigured,
  ProviderApiError,
  ProviderConfigError,
  ProviderRateLimitError,
  resolveModel,
} from "@/lib/ai-model-catalog";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 120;

const bodySchema = z.object({
  postType: z.enum([
    "motivational",
    "study-tip",
    "notice",
    "offer",
    "custom",
    "job-notice",
  ]),
  provider: z
    .enum(["mistral", "omniroute", "anthropic", "gemini", "openai"])
    .default("mistral"),
  model: z.string().min(1).max(200).optional(),
  context: z.string().max(8000).optional(),
  extraInstructions: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { postType, provider, model, context, extraInstructions } = body;

  if (!(await isProviderConfigured(provider))) {
    return NextResponse.json(
      {
        error: `"${provider}" এর জন্য API key নেই। Settings → API Key Management থেকে key যোগ করুন।`,
      },
      { status: 503 },
    );
  }

  const resolved = resolveModel(provider, model);
  const prompt = buildBroadcastPostPrompt({
    postType: postType as BroadcastPostType,
    context,
    extraInstructions,
  });

  try {
    const { text } = await callModelWithRotation(
      provider,
      resolved.modelString,
      prompt,
      1200,
    );
    const draft = text.trim();
    if (!draft) {
      return NextResponse.json(
        { error: "AI খালি পোস্ট ফেরত দিয়েছে। আবার চেষ্টা করুন।" },
        { status: 502 },
      );
    }
    return NextResponse.json({
      draft,
      provider: resolved.provider,
      model: resolved.modelString,
      modelLabel: resolved.label,
      postType,
    });
  } catch (err) {
    if (err instanceof ProviderConfigError) {
      return NextResponse.json({ error: `${resolved.label} API key সেট নেই।` }, { status: 503 });
    }
    if (err instanceof ProviderRateLimitError) {
      const retryAfterSec = await getEarliestRetryAfterSeconds(provider);
      return NextResponse.json(
        { error: `${resolved.label} rate-limited। কিছুক্ষণ পর আবার চেষ্টা করুন।` },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
      );
    }
    if (err instanceof ProviderApiError) {
      return NextResponse.json(
        { error: `${resolved.label} API error (${err.status})` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 },
    );
  }
}
