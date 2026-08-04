import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── Mistral AI config ───────────────────────────────────────────────────────
// mistral-large-latest gives the best quality for Bengali MCQ generation /
// detailed explanations. Swap to "mistral-small-latest" (cheaper) if cost is
// a concern — the prompt/JSON contract below works with either.
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-large-latest";
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = { maxRequests: 10, windowMs: 60_000 };

// Maximum input text length to prevent abuse
const MAX_RAW_TEXT_LENGTH = 50_000;

// ============================================================
// MCQ Question Factory — buildPrompt()
// Single source of truth for all exam question generation
// Supports: BCS, NTRCA, Primary, Bank, Custom/Topic-wise
// ============================================================

export type ExamType = "BCS" | "NTRCA" | "Primary" | "Bank" | "Custom";

export interface BuildPromptOptions {
  rawText: string;
  subjectHint: string;
  startSortOrder: number;
  expectedCount?: number;
  examType?: ExamType;
}

const SUBJECT_LISTS: Record<ExamType, string> = {
  BCS: "বাংলা ভাষা ও সাহিত্য, ইংরেজি ভাষা ও সাহিত্য, বাংলাদেশ বিষয়াবলি, আন্তর্জাতিক বিষয়াবলি, ভূগোল ও পরিবেশ ও দুর্যোগ ব্যবস্থাপনা, সাধারণ বিজ্ঞান, কম্পিউটার ও তথ্যপ্রযুক্তি, গাণিতিক যুক্তি, মানসিক দক্ষতা, নৈতিকতা মূল্যবোধ ও সুশাসন",
  NTRCA: "বাংলা ভাষা ও সাহিত্য, ইংরেজি ভাষা ও সাহিত্য, গণিত, সাধারণ জ্ঞান",
  Primary: "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান",
  Bank: "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান, কম্পিউটার ও তথ্যপ্রযুক্তি",
  Custom: "auto-detect from content",
};

function buildPrompt({
  rawText,
  subjectHint,
  startSortOrder,
  expectedCount = 25,
  examType = "NTRCA",
}: BuildPromptOptions): string {
  const subjectScope = SUBJECT_LISTS[examType];
  const forceSubject =
    subjectHint && subjectHint !== "auto-detect"
      ? `"${subjectHint}"`
      : "auto-detect based on question content";

  return `You are an expert MCQ question processor for Bangladesh public job exam preparation (${examType}).

Your dual ability:
A) EXTRACT: Parse structured MCQ questions from messy OCR, raw text, or unformatted question banks.
B) GENERATE: If the input is a topic name, paragraph, or raw knowledge text — CREATE high-quality MCQ questions from it.

DETECT MODE automatically:
— Input contains question marks (?) or option markers (ক/খ/গ/ঘ or A/B/C/D) → MODE A (Extract)
— Otherwise → MODE B (Generate from content)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE A — EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Strip question number prefixes — remove "১.", "০১.", "1.", "(১)", "Q1.", "প্রশ্ন ১:" etc. from questionText
2. Map option letters correctly: ক→A, খ→B, গ→C, ঘ→D (or keep A/B/C/D directly)
3. Detect correct answer from any of these markers:
   — "উত্তর:", "সঠিক উত্তর:", "Ans:", "Answer:", "উঃ"
   — Bold or underlined option in original text
   — Trailing marker like "— উত্তর: খ" at end of question
4. If a "ব্যাখ্যা:" section exists → use it as the explanation base AND elaborate it significantly
5. SKIP non-question content: page headers, decorative separator lines, QR codes, app advertisements, grammar tables that are not part of a question

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE B — GENERATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Analyze the topic/paragraph deeply using your training knowledge
2. Create EXACTLY ${expectedCount} questions that are:
   — The most frequently asked questions on this topic in past ${examType} exams
   — Covering all sub-aspects and important details of the topic
   — Having 4 plausible, well-crafted distractors (no obviously wrong options)
   — Ranging from basic recall to application-level difficulty
3. Prioritize questions that appeared in:
   — NTRCA: 10th through 18th registration exams
   — BCS: 43rd through 48th BCS preliminaries
   — Primary: recent 2018–2023 primary recruitment exams
4. Add question number prefix in Bengali format: "০১.", "০২." etc. inside questionText

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPLANATION FORMAT — MANDATORY STRUCTURE (every question)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write the explanation using this exact multi-line structure.
Use \\n in JSON output for each new line break.

Line 1:   সঠিক উত্তর: (ক/খ/গ/ঘ) [exact answer text]
Line 2:   [blank]
Line 3:   [1 sentence: why this topic/question matters in ${examType} exams]
Line 4:   [blank]
Line 5:   [Section heading — main concept name]:
Lines 6+: — [key fact 1 with specific detail]
          — [key fact 2 with specific detail]
          — [key fact 3 — historical/numerical/comparative detail]
          — [key fact 4 — additional context or exception]
Line N:   [blank]
Line N+1: [Why wrong options are wrong — heading or inline]:
          ✗ [optionX text]: [specific reason it is wrong]
          ✗ [optionY text]: [specific reason it is wrong]
          ✗ [optionZ text]: [specific reason it is wrong]
Last:     [blank]
          উৎস: [Book name — ড. Author / NTRCA প্রশ্নব্যাংক / NCTB নবম-দশম শ্রেণি / BCS প্রশ্নব্যাংক]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBJECT CLASSIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exam type    : ${examType}
Valid subjects: ${subjectScope}
Subject to use: ${forceSubject}
topic        : auto-detect from question content (be specific, e.g., "সমাস", "ক্রিয়ার কাল")
subTopic     : auto-detect and be even more specific (e.g., "বহুব্রীহি সমাস", "Simple Present Tense")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
— Output a single JSON OBJECT ONLY — no markdown, no code fences, no explanation text outside the object
— The object must have exactly this shape: { "questions": [ ... ] }
— sortOrder starts at ${startSortOrder} and increments by 1 for each question
— correctAnswer must be exactly one character: "A", "B", "C", or "D"
— explanation: use \\n for newlines (valid JSON string — not literal line breaks)
— All text fields in Bengali except for English-language questions/options
— questionText for Mode B: include prefix like "০১." at the start

{
  "questions": [
    {
      "questionText": "string — clean, no stray number prefix for Mode A; with ০১. prefix for Mode B",
      "optionA": "string",
      "optionB": "string",
      "optionC": "string",
      "optionD": "string",
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "string — multi-line Bengali explanation using \\n",
      "subject": "string — Bengali subject name from valid list above",
      "topic": "string — specific Bengali topic",
      "subTopic": "string — even more specific Bengali sub-topic",
      "sortOrder": ${startSortOrder}
    }
  ]
}

INPUT TEXT:
===START===
${rawText}
===END===`;
}

// ============================================================
// Mistral API key pool — round-robin rotation with per-key
// rate-limit cooldown.
//
// Supports multiple comma-separated keys, e.g.:
//   MISTRAL_API_KEYS="key1,key2,key3,key4,key5"
// (falls back to a single MISTRAL_API_KEY if that's all you have)
//
// State lives at module scope, so it's shared across warm invocations
// of this route on the same server/lambda instance — that's what makes
// rotation + cooldown tracking actually useful instead of resetting on
// every single request.
// ============================================================

interface MistralKeySlot {
  key: string;
  lastUsedAt: number;
  rateLimitedUntil: number; // epoch ms; 0 = not currently rate-limited
}

let keyPool: MistralKeySlot[] | null = null;

function getKeyPool(): MistralKeySlot[] {
  if (keyPool) return keyPool;
  const raw = process.env.MISTRAL_API_KEYS ?? process.env.MISTRAL_API_KEY ?? "";
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  keyPool = keys.map((key) => ({ key, lastUsedAt: 0, rateLimitedUntil: 0 }));
  return keyPool;
}

/** Least-recently-used key that isn't currently cooling down from a 429. */
function pickAvailableKey(pool: MistralKeySlot[]): MistralKeySlot | null {
  const now = Date.now();
  const available = pool.filter((s) => s.rateLimitedUntil <= now);
  if (available.length === 0) return null;
  available.sort((a, b) => a.lastUsedAt - b.lastUsedAt);
  return available[0];
}

class MistralConfigError extends Error {}
class MistralRateLimitError extends Error {}
class MistralApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Mistral API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

async function callMistralWithRotation(
  prompt: string,
  maxOutputTokens: number,
): Promise<{ text: string; finishReason: string }> {
  const pool = getKeyPool();
  if (pool.length === 0) throw new MistralConfigError();

  let lastError: unknown = null;

  // Try up to one attempt per key — each key either succeeds, gets skipped
  // for a network hiccup, or gets marked rate-limited and we move on.
  for (let attempt = 0; attempt < pool.length; attempt++) {
    const slot = pickAvailableKey(pool);
    if (!slot) break; // every key is currently cooling down

    slot.lastUsedAt = Date.now();

    let res: Response;
    try {
      res = await fetch(MISTRAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${slot.key}`,
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          max_tokens: maxOutputTokens,
          temperature: 0.05,
          top_p: 0.95,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (err) {
      lastError = err;
      continue; // network error — try the next key
    }

    if (res.status === 429) {
      const retryAfterHeader = res.headers.get("Retry-After");
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : 60_000;
      slot.rateLimitedUntil =
        Date.now() + (Number.isFinite(retryAfterMs) ? retryAfterMs : 60_000);
      lastError = new MistralRateLimitError();
      continue; // try the next key immediately
    }

    if (res.status === 401 || res.status === 403) {
      // Bad/revoked key — cool it down for a long time so we stop trying it,
      // but keep going with the remaining keys in the pool.
      slot.rateLimitedUntil = Date.now() + 24 * 60 * 60 * 1000;
      lastError = new MistralApiError(
        res.status,
        await res.text().catch(() => ""),
      );
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new MistralApiError(res.status, body);
    }

    const data = (await res.json()) as {
      choices?: {
        message?: { content?: string };
        finish_reason?: string;
      }[];
    };
    const text = data?.choices?.[0]?.message?.content ?? "";
    const finishReason = data?.choices?.[0]?.finish_reason ?? "";
    if (!text) throw new Error("EMPTY_RESPONSE");
    return { text, finishReason };
  }

  if (lastError instanceof MistralApiError) throw lastError;
  throw new MistralRateLimitError();
}

export async function POST(req: NextRequest) {
  // ─── Per-IP Rate Limiting ──────────────────────────────────────────────────
  const clientIp = getClientIp(req.headers);
  const rateLimitResult = rateLimit(clientIp, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          ),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // ─── API Key Config Check ──────────────────────────────────────────────────
  const pool = getKeyPool();
  if (pool.length === 0) {
    return NextResponse.json(
      {
        error:
          "MISTRAL_API_KEYS পরিবেশ পরিবর্তনশীল সেট করা নেই। frontend/.env.local এ MISTRAL_API_KEYS=key1,key2,key3,key4,key5 যোগ করুন (কমা দিয়ে একাধিক key দিতে পারবেন)।",
      },
      { status: 503 },
    );
  }

  // ─── Input Validation ──────────────────────────────────────────────────────
  const bodySchema = z.object({
    rawText: z.string().min(1).max(MAX_RAW_TEXT_LENGTH),
    subjectHint: z.string().max(200).optional().default(""),
    startSortOrder: z.number().int().min(1).max(10000).optional().default(1),
    expectedCount: z.number().int().min(1).max(100).optional().default(25),
    examType: z
      .enum(["BCS", "NTRCA", "Primary", "Bank", "Custom"])
      .optional()
      .default("NTRCA"),
  });

  let body: z.infer<typeof bodySchema>;
  try {
    const rawBody = await req.json();
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rawText, subjectHint, startSortOrder, expectedCount, examType } =
    body;

  const prompt = buildPrompt({
    rawText: rawText.trim(),
    subjectHint,
    startSortOrder,
    expectedCount,
    examType,
  });

  // Scale the output token budget with how many questions are expected —
  // each question + its detailed multi-line Bengali explanation runs
  // roughly 300–400 tokens.
  const maxOutputTokens = Math.min(16000, Math.max(4096, expectedCount * 380));

  let rawOutput: string;
  let finishReason: string;
  try {
    const result = await callMistralWithRotation(prompt, maxOutputTokens);
    rawOutput = result.text;
    finishReason = result.finishReason;
  } catch (err) {
    if (err instanceof MistralConfigError) {
      return NextResponse.json(
        { error: "MISTRAL_API_KEYS সঠিকভাবে সেট করা নেই।" },
        { status: 503 },
      );
    }
    if (err instanceof MistralRateLimitError) {
      const now = Date.now();
      const soonest =
        pool.length > 0
          ? Math.min(...pool.map((s) => s.rateLimitedUntil))
          : now + 60_000;
      const retryAfterSec = Math.max(1, Math.ceil((soonest - now) / 1000));
      return NextResponse.json(
        {
          error:
            "সব Mistral API key বর্তমানে rate-limited (429)। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
      );
    }
    if (err instanceof MistralApiError) {
      return NextResponse.json(
        {
          error: `Mistral API error (${err.status}): ${err.body.slice(0, 300)}`,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: `Network error calling Mistral: ${String(err)}` },
      { status: 502 },
    );
  }

  if (!rawOutput) {
    return NextResponse.json(
      { error: "Mistral থেকে খালি রেসপন্স পাওয়া গেছে।" },
      { status: 500 },
    );
  }

  // Strip markdown fences if the model ignores response_format (safety net)
  const cleaned = rawOutput
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let questions: unknown[];
  try {
    const parsedJson = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsedJson)) {
      questions = parsedJson;
    } else if (
      parsedJson &&
      typeof parsedJson === "object" &&
      Array.isArray((parsedJson as { questions?: unknown }).questions)
    ) {
      questions = (parsedJson as { questions: unknown[] }).questions;
    } else {
      throw new Error("Unexpected JSON shape");
    }
  } catch {
    // If truncated JSON (maxTokens hit), try to recover the partial array
    const partial = tryRecoverPartialJson(cleaned);
    if (partial.length > 0) {
      return NextResponse.json({
        questions: partial,
        count: partial.length,
        warning:
          finishReason === "length"
            ? `আউটপুট সীমা পৌঁছে গেছে — মাত্র ${partial.length} টি প্রশ্ন পার্স হয়েছে। বাকিগুলো পরের ব্যাচে পার্স করুন।`
            : "আংশিক পার্স সফল হয়েছে।",
      });
    }
    return NextResponse.json(
      {
        error:
          "AI আউটপুট পার্স করতে ব্যর্থ হয়েছে। ইনপুট ছোট করে আবার চেষ্টা করুন।",
        raw: rawOutput.slice(0, 400),
      },
      { status: 500 },
    );
  }

  if (!Array.isArray(questions)) {
    return NextResponse.json(
      { error: "Mistral থেকে প্রত্যাশিত JSON array পাওয়া যায়নি।" },
      { status: 500 },
    );
  }

  const warning =
    finishReason === "length"
      ? `আউটপুট সীমা পৌঁছে গেছে — ${questions.length} টি প্রশ্ন পার্স হয়েছে। বাকিগুলো পরের ব্যাচে পার্স করুন।`
      : undefined;

  return NextResponse.json({ questions, count: questions.length, warning });
}

/**
 * Best-effort: extract complete JSON objects from a truncated response.
 * Works whether the top level is `{ "questions": [ {...}, {...} ] }`
 * (normal case) or a bare `[ {...}, {...} ]` (fallback), by first trying
 * to anchor on the "questions" array if present.
 */
function tryRecoverPartialJson(text: string): unknown[] {
  const arrayMatch = text.match(/"questions"\s*:\s*\[/);
  const scanStart = arrayMatch ? arrayMatch.index! + arrayMatch[0].length : 0;

  const results: unknown[] = [];
  let depth = 0;
  let start = -1;
  for (let i = scanStart; i < text.length; i++) {
    if (text[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          results.push(JSON.parse(text.slice(start, i + 1)));
        } catch {
          // skip malformed object
        }
        start = -1;
      }
    }
  }
  return results;
}
