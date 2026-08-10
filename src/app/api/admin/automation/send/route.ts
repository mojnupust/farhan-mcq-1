import { requireAdmin } from "@/lib/admin-guard";
import {
  buildJobCircularCaption,
  fetchJobCircular,
  fetchPdfForBroadcast,
  fetchQuestionSetSlideImage,
} from "@/lib/broadcast-content-resolver";
import {
  createBroadcastLogOnBackend,
  getAdminUserIdFromRequest,
  updateBroadcastLogOnBackend,
} from "@/lib/broadcast-backend";
import {
  getConfigsForPlatform,
  type BroadcastPlatformName,
  type IntegrationConfig,
  type TelegramConfig,
} from "@/lib/integration-key-store";
import {
  sendPhotoBufferToPlatform,
  sendPhotoToPlatform,
  sendPlainTextToPlatform,
  sendTelegramDocumentBuffer,
} from "@/lib/social-channels";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 300;

const platformEnum = z.enum([
  "TELEGRAM_GROUP",
  "TELEGRAM_CHANNEL",
  "FACEBOOK_PAGE",
]);

const contentTypeEnum = z.enum([
  "MOTIVATIONAL",
  "STUDY_TIP",
  "NOTICE",
  "OFFER",
  "CUSTOM",
  "QUESTION",
  "QUESTION_SET",
  "PDF",
  "JOB_CIRCULAR",
  "SLIDE_IMAGE",
]);

const bodySchema = z.object({
  platforms: z.array(platformEnum).min(1),
  contentType: contentTypeEnum,
  contentText: z.string().min(1).max(10000).optional(),
  mediaUrl: z.string().url().max(2000).optional(),
  documentUrl: z.string().url().max(2000).optional(),
  caption: z.string().max(4000).optional(),
  questionIds: z.array(z.string()).optional(),
  questionSetId: z.string().optional(),
  pdfId: z.string().optional(),
  jobCircularIds: z.array(z.string()).min(1).optional(),
  aiProvider: z.string().max(50).optional(),
  aiModel: z.string().max(100).optional(),
});

const TEXT_TYPES = new Set([
  "MOTIVATIONAL",
  "STUDY_TIP",
  "NOTICE",
  "OFFER",
  "CUSTOM",
]);

type SendResultRow = {
  platform: BroadcastPlatformName;
  logId: string;
  status: "SENT" | "FAILED";
  error?: string;
  externalId?: string;
  jobCircularId?: string;
  pdfId?: string;
  questionSetId?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendOneAttempt(
  req: NextRequest,
  platform: BroadcastPlatformName,
  logPayload: Record<string, unknown>,
  sendFn: (config: IntegrationConfig) => Promise<{ externalId?: string }>,
): Promise<SendResultRow> {
  let logId: string | null = null;
  try {
    const log = await createBroadcastLogOnBackend(req, {
      ...logPayload,
      platforms: [platform],
      status: "SENDING",
    });
    logId = log.id;

    const configs = await getConfigsForPlatform(platform);
    if (!configs.length) {
      throw new Error(`No active credential for ${platform}`);
    }

    const sent = await sendFn(configs[0]!);

    await updateBroadcastLogOnBackend(logId, {
      status: "SENT",
      sentAt: new Date().toISOString(),
      errorMessage: null,
    });

    return {
      platform,
      logId,
      status: "SENT",
      externalId: sent.externalId,
      ...(typeof logPayload.jobCircularIds === "object" &&
      Array.isArray(logPayload.jobCircularIds) &&
      logPayload.jobCircularIds[0]
        ? { jobCircularId: logPayload.jobCircularIds[0] as string }
        : {}),
      ...(logPayload.pdfId ? { pdfId: logPayload.pdfId as string } : {}),
      ...(logPayload.questionSetId
        ? { questionSetId: logPayload.questionSetId as string }
        : {}),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (logId) {
      await updateBroadcastLogOnBackend(logId, {
        status: "FAILED",
        errorMessage: message,
      }).catch(() => {});
    }
    return {
      platform,
      logId: logId ?? "—",
      status: "FAILED",
      error: message,
      ...(typeof logPayload.jobCircularIds === "object" &&
      Array.isArray(logPayload.jobCircularIds) &&
      logPayload.jobCircularIds[0]
        ? { jobCircularId: logPayload.jobCircularIds[0] as string }
        : {}),
    };
  }
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!getAdminUserIdFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const {
    platforms,
    contentType,
    contentText,
    mediaUrl,
    documentUrl,
    caption,
    questionIds,
    questionSetId,
    pdfId,
    jobCircularIds,
    aiProvider,
    aiModel,
  } = body;

  const baseLog = {
    contentType,
    questionIds: questionIds ?? [],
    aiProvider,
    aiModel,
  };

  const results: SendResultRow[] = [];
  let sendIndex = 0;

  async function runSpaced(
    fn: () => Promise<SendResultRow>,
  ): Promise<SendResultRow> {
    if (sendIndex++ > 0) await sleep(2500);
    return fn();
  }

  // ─── Job circulars: one post per circular per platform ─────────────────
  if (contentType === "JOB_CIRCULAR") {
    const ids = jobCircularIds ?? [];
    if (!ids.length) {
      return NextResponse.json(
        { error: "jobCircularIds required for JOB_CIRCULAR" },
        { status: 400 },
      );
    }

    for (const jobId of ids) {
      const job = await fetchJobCircular(req, jobId);
      const postCaption = contentText?.trim() || buildJobCircularCaption(job);

      for (const platform of platforms) {
        results.push(
          await runSpaced(() =>
            sendOneAttempt(
              req,
              platform,
              {
                ...baseLog,
                jobCircularIds: [jobId],
                contentText: postCaption,
                mediaUrl: job.logoUrl ?? undefined,
              },
              async (config) => {
                if (job.logoUrl) {
                  return sendPhotoToPlatform(
                    platform,
                    config,
                    job.logoUrl,
                    postCaption,
                  );
                }
                return sendPlainTextToPlatform(platform, config, postCaption);
              },
            ),
          ),
        );
      }
    }

    const allFailed = results.every((r) => r.status === "FAILED");
    return NextResponse.json({ results, ok: !allFailed }, { status: allFailed ? 502 : 200 });
  }

  // ─── PDF: Telegram document; Facebook text summary ─────────────────────
  if (contentType === "PDF") {
    if (!pdfId) {
      return NextResponse.json({ error: "pdfId required for PDF" }, { status: 400 });
    }

    const pdf = await fetchPdfForBroadcast(req, pdfId);
    const pdfCaption = caption?.trim() || contentText?.trim() || pdf.title;

    for (const platform of platforms) {
      results.push(
        await runSpaced(() =>
          sendOneAttempt(
            req,
            platform,
            {
              ...baseLog,
              pdfId,
              contentText: pdfCaption,
            },
            async (config) => {
              if (platform === "FACEBOOK_PAGE") {
                const msg = `${pdfCaption}\n\n(সম্পূর্ণ PDF Telegram-এ শেয়ার করা হয়েছে)`;
                return sendPlainTextToPlatform(platform, config, msg);
              }
              return sendTelegramDocumentBuffer(
                config as TelegramConfig,
                pdf.buffer,
                pdf.fileName,
                pdfCaption,
                platform,
              );
            },
          ),
        ),
      );
    }

    const allFailed = results.every((r) => r.status === "FAILED");
    return NextResponse.json({ results, ok: !allFailed }, { status: allFailed ? 502 : 200 });
  }

  // ─── Question set: render grouped slide, send as photo ──────────────────
  if (contentType === "QUESTION_SET") {
    if (!questionSetId) {
      return NextResponse.json(
        { error: "questionSetId required for QUESTION_SET" },
        { status: 400 },
      );
    }

    const slide = await fetchQuestionSetSlideImage(req, questionSetId);
    const slideCaption =
      caption?.trim() || contentText?.trim() || "Farhan MCQ — প্রশ্ন সেট";

    for (const platform of platforms) {
      results.push(
        await runSpaced(() =>
          sendOneAttempt(
            req,
            platform,
            {
              ...baseLog,
              questionSetId,
              contentText: slideCaption,
              mediaUrl: mediaUrl,
            },
            async (config) => {
              if (platform === "FACEBOOK_PAGE" && mediaUrl) {
                return sendPhotoToPlatform(platform, config, mediaUrl, slideCaption);
              }
              if (platform === "FACEBOOK_PAGE") {
                return sendPlainTextToPlatform(
                  platform,
                  config,
                  `${slideCaption}\n\n(ছবি Telegram-এ পাঠানো হয়েছে — Facebook-এ public image URL প্রয়োজন)`,
                );
              }
              return sendPhotoBufferToPlatform(
                platform,
                config,
                slide.buffer,
                slideCaption,
                mediaUrl,
              );
            },
          ),
        ),
      );
    }

    const allFailed = results.every((r) => r.status === "FAILED");
    return NextResponse.json({ results, ok: !allFailed }, { status: allFailed ? 502 : 200 });
  }

  // ─── Text / legacy URL sends ───────────────────────────────────────────
  if (TEXT_TYPES.has(contentType) && !contentText?.trim()) {
    return NextResponse.json(
      { error: "Text content types require contentText" },
      { status: 400 },
    );
  }

  for (const platform of platforms) {
    results.push(
      await runSpaced(() =>
        sendOneAttempt(
          req,
          platform,
          {
            ...baseLog,
            contentText: contentText ?? caption,
            mediaUrl: mediaUrl ?? documentUrl,
            questionSetId,
            pdfId,
            jobCircularIds: jobCircularIds ?? [],
          },
          async (config) => {
            if (TEXT_TYPES.has(contentType)) {
              return sendPlainTextToPlatform(
                platform,
                config,
                contentText!.trim(),
              );
            }
            if (documentUrl && platform !== "FACEBOOK_PAGE") {
              throw new Error("Use pdfId for PDF broadcast — documentUrl alone is deprecated");
            }
            if (mediaUrl) {
              return sendPhotoToPlatform(
                platform,
                config,
                mediaUrl,
                caption ?? contentText,
              );
            }
            throw new Error("Unsupported payload for this content type");
          },
        ),
      ),
    );
  }

  const allFailed = results.every((r) => r.status === "FAILED");
  return NextResponse.json({ results, ok: !allFailed }, { status: allFailed ? 502 : 200 });
}
