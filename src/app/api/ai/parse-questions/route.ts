import { requireAdmin } from "@/lib/admin-guard";
import {
  callModelWithRotation,
  getEarliestRetryAfterSeconds,
  isProviderConfigured,
  ProviderApiError,
  ProviderConfigError,
  ProviderRateLimitError,
  resolveModel,
} from "@/lib/ai-model-catalog";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// Allow this route to run long enough to finish multi-batch generation runs.
// (Needs a Vercel plan that supports >60s function duration; on Hobby this
// caps out around 60s regardless of what's set here.)
export const maxDuration = 300;

// Which model actually runs a generation is resolved per-request from
// src/lib/ai-model-catalog.ts — that's the single source of truth for
// providers, their official API adapters, and key pools. This route just
// validates the request, builds the prompt, and drives the batching loop.
// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = { maxRequests: 10, windowMs: 60_000 };

// Maximum input text length to prevent abuse
const MAX_RAW_TEXT_LENGTH = 50_000;

// Each call generates at most this many questions — keeps a single call
// reliable (small enough to fit comfortably in the token budget without
// truncation). Larger totals are produced by looping multiple batches.
const BATCH_SIZE = 20;

// Hard ceiling on how many batches one request will run, so a bad
// expectedCount (or a stuck loop) can't run forever. 15 × 20 = 300 questions.
const MAX_BATCHES = 15;

// ============================================================
// MCQ Question Factory — buildPrompt()
// Single source of truth for all exam question generation.
//
// The prompt is driven entirely by the REAL question set the questions are
// being generated for — subject, topics, source material, and exam/sub-exam
// category all come straight from the database record, not from a manual
// hint typed into a form. This makes subject classification a non-issue
// (we already know the subject) and lets the model write in the actual
// register/difficulty of that specific exam.
// ============================================================

export interface QuestionSetContext {
  subject: string;
  topics?: string | null;
  sourceMaterial?: string | null;
  title?: string | null;
  examCategoryName?: string | null;
  subExamCategoryName?: string | null;
}

export interface BuildPromptOptions {
  rawText: string;
  startSortOrder: number;
  batchCount: number;
  questionSet: QuestionSetContext;
}

function buildPrompt({
  rawText,
  startSortOrder,
  batchCount,
  questionSet,
}: BuildPromptOptions): string {
  const {
    subject,
    topics,
    sourceMaterial,
    title,
    examCategoryName,
    subExamCategoryName,
  } = questionSet;

  const examLabel = [examCategoryName, subExamCategoryName]
    .filter(Boolean)
    .join(" — ");

  return `You are an expert MCQ question processor for Bangladesh public job exam preparation.

Your dual ability:
A) EXTRACT: Pull out genuinely complete, pre-written MCQs from messy OCR or raw pasted text.
B) GENERATE: Turn definitions, grammar rules, topic notes, or knowledge paragraphs into brand-new, exam-quality MCQs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAM CONTEXT — AUTHORITATIVE, taken directly from this question set's record.
Do not override, guess, or invent different values for any of these.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
পরীক্ষার ধরন     : ${examLabel || "উল্লেখ নেই"}
সেটের শিরোনাম    : ${title || "উল্লেখ নেই"}
Subject (FIXED)  : "${subject}"
Topics scope     : ${topics || "(নির্দিষ্ট করা নেই — rawText থেকেই বুঝে নাও)"}
Source material  : ${sourceMaterial || "(নির্দিষ্ট করা নেই)"}

RULES tied to this context:
— Every question's "subject" field must be exactly "${subject}" — copy it verbatim, never invent a different subject.
— "topic" and "subTopic" must be specific sub-points that plausibly fall under "${subject}"${topics ? ` and within this scope: ${topics}` : ""}.
${sourceMaterial ? `— The explanation's "উৎস:" line must cite exactly this source: "${sourceMaterial}" — do not invent a different book/source.` : `— The explanation's "উৎস:" line should cite the most standard reference book for this subject/topic (e.g. NCTB textbook, a well-known BCS/NTRCA guide) — pick something plausible and specific, not "উল্লেখ নেই".`}
— Match the difficulty, phrasing style, and question types typical of ${examLabel || "Bangladesh competitive government job"} exams. Use your training knowledge of real past exam questions on this exact topic — you know which facts and question angles recur most often across BCS, NTRCA, Bank, and Primary recruitment exams. Favor those.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT QUESTION TEXT RULE (APPLIES TO ALL MODES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
— CRITICAL: "questionText" MUST NEVER CONTAIN ANY QUESTION NUMBER PREFIX OR SERIAL NUMBER.
— Strip ALL leading language numbers, prefixes, and markers (e.g., "১.", "১১.", "১২.", "০১.", "1.", "11.", "(১2)", "Q11.", "প্রশ্ন ১১:") from "questionText".
— Output ONLY the clean question string in "questionText".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE DETECTION — read carefully, do not pattern-match blindly on ক/খ/গ/ঘ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bengali ordinal labels ক./খ./গ./ঘ./ঙ./চ. are used for TWO very different things
in real study material, and you must tell them apart:

  (1) MCQ option markers — a short question stem, immediately followed by
      4 short, parallel candidate answers (a word or short phrase each) for
      THAT one question. → This is a genuine MCQ. Extract it (MODE A).

  (2) Section / sub-point labels — used in grammar notes, rule lists, and
      textbook excerpts to number separate explanatory points, each
      followed by a full sentence, a rule, or a list of examples (not 4
      parallel short answers). → This is NOT an MCQ, it's source knowledge.
      Treat it as MODE B material and generate fresh questions from it.

  Quick test: strip the ক./খ./গ./ঘ. labels. Does what's left read as ONE
  question with 4 candidate answers? → MODE A. Does it read as a numbered
  list of separate rules/definitions/examples? → MODE B.

A single input is very often MIXED: extract any genuinely complete MCQs you
find (MODE A) AND generate the rest of the required questions from whatever
explanatory/rule content is left over (MODE B), so the total question count
below is always met — don't stop early just because the source ran out of
literal ready-made MCQs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE A — EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Strip all question prefixes/numbers completely from questionText.
2. Map option letters correctly: ক→A, খ→B, গ→C, ঘ→D (or keep A/B/C/D directly)
3. Detect correct answer from any of these markers:
   — "উত্তর:", "সঠিক উত্তর:", "Ans:", "Answer:", "উঃ"
   — Bold or underlined option in original text
   — Trailing marker like "— উত্তর: খ" at end of question
4. If a "ব্যাখ্যা:" section exists → use it as the explanation base AND elaborate it significantly
5. SKIP non-question content: page headers, decorative separator lines, QR codes, app advertisements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE B — GENERATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Analyze the source content (rawText + your own training knowledge of this exact topic) deeply
2. Create high-quality questions that are:
   — The most frequently asked question angles on this topic in real past exams
   — Covering all sub-aspects of the topic present in the source content
   — Having 4 plausible, well-crafted distractors (no obviously wrong options)
   — Ranging from basic recall to application-level difficulty
3. Do NOT add any leading numbers or prefixes (like "০১.", "১১.") inside questionText.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPLANATION FORMAT — MANDATORY STRUCTURE (every question)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write the explanation using this exact multi-line structure.
Use \n in JSON output for each new line break.

Line 1:   সঠিক উত্তর: (ক/খ/গ/ঘ) [exact answer text]
Line 2:   [blank]
Line 3:   [1 sentence: why this topic/question matters for this exam]
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
          উৎস: [see Source material rule above]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FREQUENCY TAG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fill "frequencyTag" with a short Bengali phrase describing how often this
exact question / topic angle tends to appear in real exams, based on your
training knowledge — e.g. "বিগত ৫ বছরে বহুবার এসেছে", "প্রতি বিসিএসেই আসে",
"সাম্প্রতিক ট্রেন্ড", "মাঝে মাঝে আসে". Be honest — if you're not confident it's
a high-frequency topic, say something modest rather than overclaiming.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
— Output a single JSON OBJECT ONLY — no markdown, no code fences, no explanation text outside the object
— The object must have exactly this shape: { "questions": [ ... ] }
— Produce EXACTLY ${batchCount} questions this call.
— sortOrder starts at ${startSortOrder} and increments by 1 for each question
— correctAnswer must be exactly one character: "A", "B", "C", or "D"
— explanation: use \n for newlines (valid JSON string — not literal line breaks)
— All text fields in Bengali except for English-language questions/options
— questionText must NEVER contain question numbers or prefixes (like "১১." or "11.").

{
  "questions": [
    {
      "questionText": "string",
      "optionA": "string",
      "optionB": "string",
      "optionC": "string",
      "optionD": "string",
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "string — multi-line Bengali explanation using \\n",
      "subject": "${subject}",
      "topic": "string — specific Bengali topic",
      "subTopic": "string — even more specific Bengali sub-topic",
      "frequencyTag": "string — short Bengali frequency note",
      "sortOrder": ${startSortOrder}
    }
  ]
}

SOURCE TEXT (may be raw MCQs to extract, explanatory content to generate from, or a mix of both):
===START===
${rawText}
===END===`;
}

/**
 * Parse one Mistral call's raw output into a question array, tolerating
 * either `{ "questions": [...] }` (expected) or a bare `[...]` (fallback),
 * and recovering partial results if the JSON was cut off by the token limit.
 */
function parseQuestionsFromOutput(rawOutput: string): unknown[] {
  const cleaned = rawOutput
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsedJson = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsedJson)) return parsedJson;
    if (
      parsedJson &&
      typeof parsedJson === "object" &&
      Array.isArray((parsedJson as { questions?: unknown }).questions)
    ) {
      return (parsedJson as { questions: unknown[] }).questions;
    }
  } catch {
    // fall through to partial recovery below
  }
  return tryRecoverPartialJson(cleaned);
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

function describeError(err: unknown): string {
  if (err instanceof ProviderConfigError)
    return `${err.provider} এর API key সেট করা নেই।`;
  if (err instanceof ProviderRateLimitError)
    return `${err.provider} এর সব key সাময়িকভাবে rate-limited।`;
  if (err instanceof ProviderApiError)
    return `${err.provider} API error (${err.status}): ${err.body.slice(0, 150)}`;
  return `Network/parse error: ${String(err)}`;
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

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

  // ─── Input Validation ──────────────────────────────────────────────────────
  const bodySchema = z.object({
    rawText: z.string().min(1).max(MAX_RAW_TEXT_LENGTH),
    startSortOrder: z.number().int().min(1).max(10000).optional().default(1),
    expectedCount: z.number().int().min(1).max(300),
    provider: z
      .enum(["mistral", "omniroute", "anthropic", "gemini", "openai"])
      .optional()
      .default("mistral"),
    // For "omniroute": which live OmniRoute model to use (or "auto").
    // For everything else: one of the catalog ids from ai-model-catalog.ts
    // (e.g. "claude-opus-4-8"). Left blank falls back to that provider's
    // first/default catalog entry.
    model: z.string().min(1).max(200).optional(),
    questionSet: z.object({
      subject: z.string().min(1).max(200),
      topics: z.string().max(1000).optional().nullable(),
      sourceMaterial: z.string().max(500).optional().nullable(),
      title: z.string().max(300).optional().nullable(),
      examCategoryName: z.string().max(200).optional().nullable(),
      subExamCategoryName: z.string().max(200).optional().nullable(),
    }),
  });

  let body: z.infer<typeof bodySchema>;
  try {
    const rawBody = await req.json();
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    rawText,
    startSortOrder,
    expectedCount,
    provider,
    model,
    questionSet,
  } = body;

  // ─── Provider / Key Config Check ────────────────────────────────────────────
  if (!(await isProviderConfigured(provider))) {
    return NextResponse.json(
      {
        error: `"${provider}" এর জন্য কোনো API key যোগ করা নেই। Admin → Settings → API Key Management থেকে একটি key যোগ করুন।`,
      },
      { status: 503 },
    );
  }

  const resolved = resolveModel(provider, model);

  // ─── Batched generation loop ────────────────────────────────────────────────
  // Large expectedCount (driven by totalMarks / markPerQuestion on the real
  // question set) gets split into BATCH_SIZE-sized calls so each call stays
  // comfortably inside its token budget. The key pool for this provider is
  // shared across every batch, so a key that gets rate-limited mid-run
  // doesn't stall the whole thing — the next batch simply rotates to another
  // key for the SAME provider (models are never mixed within one run).
  const allQuestions: unknown[] = [];
  const warnings: string[] = [];
  let currentSortOrder = startSortOrder;
  let remaining = expectedCount;
  let batchNum = 0;
  let fatalError: unknown = null;

  while (remaining > 0 && batchNum < MAX_BATCHES) {
    batchNum++;
    const batchCount = Math.min(BATCH_SIZE, remaining);
    const prompt = buildPrompt({
      rawText: rawText.trim(),
      startSortOrder: currentSortOrder,
      batchCount,
      questionSet,
    });
    const maxOutputTokens = Math.min(16000, Math.max(4096, batchCount * 420));

    try {
      const { text, finishReason } = await callModelWithRotation(
        provider,
        resolved.modelString,
        prompt,
        maxOutputTokens,
      );
      const parsed = parseQuestionsFromOutput(text);

      if (parsed.length === 0) {
        console.error(
          `[ai-import] batch ${batchNum} parse failed, raw output:`,
          text.slice(0, 500),
        );
        warnings.push(
          `ব্যাচ ${batchNum}: কোনো প্রশ্ন পার্স করা যায়নি। raw: ${text.slice(0, 150).replace(/\s+/g, " ")}`,
        );
        break;
      }

      allQuestions.push(...parsed);
      currentSortOrder += parsed.length;
      remaining -= parsed.length;

      if (finishReason === "length") {
        warnings.push(
          `ব্যাচ ${batchNum}: টোকেন সীমার কারণে আংশিক প্রশ্ন এসেছে (${parsed.length} টি)।`,
        );
      }
    } catch (err) {
      fatalError = err;
      warnings.push(`ব্যাচ ${batchNum}: ${describeError(err)}`);
      break; // stop the loop, but keep whatever we already collected
    }
  }

  // Nothing at all came back — surface a real error instead of an empty 200.
  if (allQuestions.length === 0) {
    if (fatalError instanceof ProviderConfigError) {
      return NextResponse.json(
        { error: `${resolved.label} এর API key সঠিকভাবে সেট করা নেই।` },
        { status: 503 },
      );
    }
    if (fatalError instanceof ProviderRateLimitError) {
      const retryAfterSec = await getEarliestRetryAfterSeconds(provider);
      return NextResponse.json(
        {
          error: `${resolved.label} এর সব API key বর্তমানে rate-limited (429)। কিছুক্ষণ পর আবার চেষ্টা করুন।`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
      );
    }
    if (fatalError instanceof ProviderApiError) {
      return NextResponse.json(
        {
          error: `${resolved.label} API error (${fatalError.status}): ${fatalError.body.slice(0, 300)}`,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        error:
          warnings.length > 0
            ? `AI থেকে কোনো ব্যবহারযোগ্য প্রশ্ন পাওয়া যায়নি। কারণ: ${warnings.join(" ")}`
            : "AI থেকে কোনো ব্যবহারযোগ্য প্রশ্ন পাওয়া যায়নি। ইনপুট ছোট করে আবার চেষ্টা করুন।",
      },
      { status: 500 },
    );
  }

  if (batchNum >= MAX_BATCHES && remaining > 0) {
    warnings.push(
      `নিরাপত্তার জন্য সর্বোচ্চ ${MAX_BATCHES} ব্যাচের সীমা পার হয়ে গেছে — বাকি ${remaining} টি প্রশ্ন এই রানে তৈরি হয়নি।`,
    );
  }

  return NextResponse.json({
    questions: allQuestions,
    count: allQuestions.length,
    targetCount: expectedCount,
    provider: resolved.provider,
    model: resolved.modelString,
    modelLabel: resolved.label,
    warning: warnings.length > 0 ? warnings.join(" ") : undefined,
  });
}
