import {
  type AiProviderId,
  callModelWithRotation,
  getEarliestRetryAfterSeconds,
  isProviderConfigured,
  ProviderApiError,
  ProviderConfigError,
  ProviderRateLimitError,
  resolveModel,
} from "@/lib/ai-model-catalog";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { decodeHtmlEntities } from "@/lib/syllabus-html";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Same reasoning as parse-questions: a full 90/180-day plan needs several
// sequential AI calls, so this route needs enough wall-clock room to finish
// the whole batching loop in one request.
export const maxDuration = 300;

const RATE_LIMIT_CONFIG = { maxRequests: 10, windowMs: 60_000 };

// Syllabus documents are curriculum outlines, not full textbooks, but we
// still cap defensively against abuse / pathological pastes.
const MAX_SYLLABUS_LENGTH = 40_000;
// How much syllabus text we're willing to spend prompt tokens on, per call
// (re-sent on every batch, so this stays modest even though the raw content
// coming from the DB can be larger — see MAX_SYLLABUS_LENGTH above).
const MAX_SYLLABUS_CHARS_IN_PROMPT = 14_000;

// One AI call plans this many routine days at a time. Each day's payload
// (title/subject/topics/description) is much smaller than a full MCQ, so a
// bigger batch than the question-generator's is safe token-wise.
const BATCH_SIZE_DAYS = 15;

// Hard ceiling so a bad totalDays (or a stuck loop) can't run forever.
// 30 × 15 = 450 days, comfortably above the 365-day input cap below.
const MAX_BATCHES = 30;

const BN_WEEKDAY = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

// ============================================================
// Schedule builder — dates/day-numbers/off-days/revision-phase are all
// computed deterministically in code, NOT by the AI. The AI only ever fills
// in the *content* (title/subject/topics/description) for a day list we
// hand it — this keeps date math and day-count guarantees 100% reliable
// regardless of what the model outputs.
// ============================================================

interface ScheduleDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  weekdayBn: string;
  phase: "core" | "revision";
}

function parseUtcDate(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function formatUtcDate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function buildSchedule(
  startDate: string,
  totalDays: number,
  offWeekday: number | null,
): ScheduleDay[] {
  const schedule: ScheduleDay[] = [];
  const cursor = parseUtcDate(startDate);

  // Last ~10% of the plan becomes a revision/model-test phase (min 2 days
  // once the plan is long enough to spare them, capped at 10 so a 300-day
  // plan doesn't burn a month on pure revision).
  const revisionCount =
    totalDays >= 10
      ? Math.min(10, Math.max(2, Math.round(totalDays * 0.1)))
      : 0;
  const revisionStartsAt = totalDays - revisionCount + 1;

  while (schedule.length < totalDays) {
    const weekday = cursor.getUTCDay();
    if (offWeekday === null || weekday !== offWeekday) {
      const dayNumber = schedule.length + 1;
      schedule.push({
        dayNumber,
        date: formatUtcDate(cursor),
        weekdayBn: BN_WEEKDAY[weekday]!,
        phase: dayNumber >= revisionStartsAt ? "revision" : "core",
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return schedule;
}

// ============================================================
// Syllabus text prep
// ============================================================

function stripHtmlToPlainText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function prepareSyllabusText(content: string, contentType: string): string {
  const plain =
    contentType === "html" ? stripHtmlToPlainText(content) : content.trim();
  if (plain.length <= MAX_SYLLABUS_CHARS_IN_PROMPT) return plain;
  return (
    plain.slice(0, MAX_SYLLABUS_CHARS_IN_PROMPT) +
    "\n…(সিলেবাস দীর্ঘ হওয়ায় এখানে সংক্ষিপ্ত করা হয়েছে — বাকি অংশও একইভাবে যৌক্তিকভাবে সময় বণ্টন করবে বলে ধরে নাও)"
  );
}

// ============================================================
// MCQ-prep Curriculum Planner — buildPrompt()
// Single source of truth for all AI-generated routine days.
// ============================================================

export interface AiRoutineDay {
  dayNumber: number;
  title: string;
  subject: string;
  topics: string;
  sourceMaterial?: string;
  description?: string;
}

interface BuildPromptOptions {
  examLabel: string;
  syllabusTitle: string;
  syllabusText: string;
  totalDaysOverall: number;
  batchDays: ScheduleDay[];
  priorCoverage: string[];
}

function buildPrompt({
  examLabel,
  syllabusTitle,
  syllabusText,
  totalDaysOverall,
  batchDays,
  priorCoverage,
}: BuildPromptOptions): string {
  const batchHasRevision = batchDays.some((d) => d.phase === "revision");
  const batchHasCore = batchDays.some((d) => d.phase === "core");

  const dayListBlock = batchDays
    .map(
      (d) =>
        `  { "dayNumber": ${d.dayNumber}, "date": "${d.date}", "weekday": "${d.weekdayBn}", "phase": "${d.phase}" }`,
    )
    .join(",\n");

  const coverageBlock =
    priorCoverage.length > 0
      ? priorCoverage.join("\n")
      : "(এটিই প্রথম ব্যাচ — এখনো কিছু শিডিউল করা হয়নি)";

  return `You are an expert curriculum planner for Bangladesh public job exam preparation (BCS, NTRCA, Bank, Primary Teacher recruitment, and similar competitive exams).

Your task: design ONE CONTINUOUS, human-quality day-by-day study routine that, across the FULL ${totalDaysOverall}-day plan, exhaustively covers every topic in the syllabus below — without cramming, without leaving anything out, and without repeating a topic before the revision phase.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAM CONTEXT — AUTHORITATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
পরীক্ষার ধরন   : ${examLabel || "উল্লেখ নেই"}
সিলেবাসের নাম   : ${syllabusTitle}
মোট প্রস্তুতির দিন : ${totalDaysOverall} দিন

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL SYLLABUS (this is the entire scope — every subject/topic listed here
must eventually be scheduled somewhere across the ${totalDaysOverall}-day plan,
not just in this batch)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${syllabusText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALREADY SCHEDULED SO FAR (earlier batches of this SAME plan — do not repeat
these topics as new content; only the REVISION days below may revisit them)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${coverageBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAYS YOU MUST PRODUCE IN THIS CALL (exactly these ${batchDays.length}, in this order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[
${dayListBlock}
]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANNING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Think of the whole ${totalDaysOverall}-day plan as one continuous course,
   not independent days — you're only writing this batch's pages of it.
2. Distribute syllabus sections across the available days roughly
   proportional to how much content they contain — don't spend 20 days on a
   short chapter and 2 days on a huge one.
3. Group closely related sub-topics on the same day or on consecutive days
   (e.g. all parts of one grammar rule together; sequential math chapters in
   their natural learning order: foundation → application → advanced).
4. If the syllabus spans multiple subjects (as in the BCS/NTRCA/Bank style
   combined syllabus), mix 2–4 subjects per day like a real exam-prep
   routine — don't finish one whole subject before touching the next one;
   rotate across subjects so the student's brain gets variety every day.
5. "topics" for a single day CAN and often SHOULD list more than one
   related sub-topic — comma-separated, same style as: "সমাস, পাটিগণিত, Part of Speech".
6. "subject" lists the broad subject area(s) covered that day, comma
   separated in the syllabus's own language mix — e.g. "বাংলা, English, গণিত"
   or just "সাধারণ বিজ্ঞান" for a single-subject syllabus.
7. Never invent topics that aren't in the syllabus above during CORE days.
${
  batchHasRevision
    ? `8. REVISION-PHASE days in this batch (phase: "revision") must recap a
   curated mix of topics from "ALREADY SCHEDULED SO FAR" (favor
   high-yield/frequently-tested ones) — do not introduce brand-new syllabus
   content on these days. If a day is the very last day of the entire plan,
   make it a full cumulative model-test / final revision day.`
    : ""
}
${
  batchHasCore
    ? `${batchHasRevision ? "9" : "8"}. CORE-phase days must move the plan forward with NEW syllabus content not
   already listed under "ALREADY SCHEDULED SO FAR".`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIELD-BY-FIELD CONTENT STYLE (match this tone/format exactly — these are
real examples from this platform's own routine data, same house style)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
title        : "দিন <N>: <২-৩টি মূল টপিক কমা দিয়ে, সংক্ষেপে>"
               e.g. "দিন ২: কর্মধারয়-তৎপুরুষ সমাস, লাভ-ক্ষতি অংক, Adjective"
subject      : কমা-সেপারেটেড বিষয়ের নাম, syllabus এর ভাষাতেই — e.g. "বাংলা, English, গণিত"
topics       : কমা-সেপারেটেড নির্দিষ্ট টপিক — e.g. "সমাস, পাটিগণিত, Part of Speech"
sourceMaterial: একটি নির্দিষ্ট, প্রাসঙ্গিক রেফারেন্স বই/উৎস — syllabus এ উল্লেখ থাকলে
               সেটাই ব্যবহার করো, না থাকলে ঐ বিষয়ের জন্য পরিচিত মানসম্মত রেফারেন্স বই
               বাছাই করো (e.g. "NCTB নবম-দশম শ্রেণি বাংলা ভাষার ব্যাকরণ বোর্ড বই")।
description  : ১-৩ বাক্যের উৎসাহব্যঞ্জক বাংলা বর্ণনা — সেদিন কী শেখা/প্র্যাকটিস করা যাবে,
               বন্ধুত্বপূর্ণ শিক্ষকের সুরে। e.g. "এই সেটে আমরা পাটিগণিত ল.সা.গু ও গ.সা.গু
               শিখব, ভাষা আন্দোলন ‍সম্পর্কে জানব।"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
— Output a single JSON OBJECT ONLY — no markdown, no code fences, no explanation text outside the object
— The object must have exactly this shape: { "days": [ ... ] }
— Produce EXACTLY ${batchDays.length} entries, one per dayNumber listed above, same order
— All text fields in Bengali, except English-language technical terms/subject names that are naturally written in English (e.g. "Adverb", "Part of Speech")
— Do not restate the date/weekday in the output — only dayNumber identifies which day a plan entry is for

{
  "days": [
    {
      "dayNumber": <number, must match the list above exactly>,
      "title": "string",
      "subject": "string",
      "topics": "string",
      "sourceMaterial": "string",
      "description": "string"
    }
  ]
}`;
}

/**
 * Parse one AI call's raw output into a day array, tolerating either
 * `{ "days": [...] }` (expected) or a bare `[...]` (fallback), and
 * recovering partial results if the JSON was cut off by the token limit.
 */
function parseDaysFromOutput(rawOutput: string): unknown[] {
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
      Array.isArray((parsedJson as { days?: unknown }).days)
    ) {
      return (parsedJson as { days: unknown[] }).days;
    }
  } catch {
    // fall through to partial recovery below
  }
  return tryRecoverPartialJson(cleaned);
}

function tryRecoverPartialJson(text: string): unknown[] {
  const arrayMatch = text.match(/"days"\s*:\s*\[/);
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

const aiDaySchema = z.object({
  dayNumber: z.number().int(),
  title: z.string().min(1),
  subject: z.string().min(1),
  topics: z.string().min(1),
  sourceMaterial: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

function describeError(err: unknown): string {
  if (err instanceof ProviderConfigError)
    return `${err.provider} এর API key সেট করা নেই।`;
  if (err instanceof ProviderRateLimitError)
    return `${err.provider} এর সব key সাময়িকভাবে rate-limited।`;
  if (err instanceof ProviderApiError)
    return `${err.provider} API error (${err.status}): ${err.body.slice(0, 150)}`;
  return `Network/parse error: ${String(err)}`;
}

// Compact one-line summaries fed back into later batches as "already
// scheduled" context — kept short so this doesn't balloon prompt size on
// long (200+ day) plans.
function toCoverageLine(day: ScheduleDay, content: AiRoutineDay): string {
  return `দিন ${day.dayNumber} (${day.date}): ${content.title} — বিষয়: ${content.subject} — টপিক: ${content.topics}`;
}

export async function POST(req: NextRequest) {
  // ─── Per-IP Rate Limiting ──────────────────────────────────────────────
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

  // ─── Input Validation ───────────────────────────────────────────────────
  const bodySchema = z.object({
    syllabus: z.object({
      title: z.string().min(1).max(300),
      content: z.string().min(1).max(MAX_SYLLABUS_LENGTH),
      contentType: z.enum(["mdx", "html"]).optional().default("mdx"),
    }),
    examCategoryName: z.string().max(200).optional().nullable(),
    subExamCategoryName: z.string().max(200).optional().nullable(),
    totalDays: z.number().int().min(1).max(365),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
    // 0=রবিবার … 6=শনিবার, or null for "no weekly off day"
    offWeekday: z
      .number()
      .int()
      .min(0)
      .max(6)
      .nullable()
      .optional()
      .default(null),
    defaultTotalMarks: z.number().int().min(1).max(200).optional().default(20),
    defaultDuration: z.number().int().min(1).max(300).optional().default(10),
    provider: z
      .enum(["mistral", "omniroute", "anthropic", "gemini", "openai"])
      .optional()
      .default("mistral"),
    model: z.string().min(1).max(200).optional(),
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
    syllabus,
    examCategoryName,
    subExamCategoryName,
    totalDays,
    startDate,
    offWeekday,
    defaultTotalMarks,
    defaultDuration,
    provider,
    model,
  } = body;

  // ─── Provider / Key Config Check ──────────────────────────────────────
  if (!isProviderConfigured(provider)) {
    const envHint: Record<AiProviderId, string> = {
      mistral:
        "MISTRAL_API_KEYS=key1,key2,key3 (কমা দিয়ে একাধিক key দিতে পারবেন)",
      omniroute:
        "OMNIROUTE_API_KEY=your-key (OmniRoute dashboard → Endpoints থেকে key কপি করুন)",
      anthropic: "ANTHROPIC_API_KEY=your-key (Anthropic console থেকে key নিন)",
      gemini: "GEMINI_API_KEY=your-key (Google AI Studio থেকে key নিন)",
      openai: "OPENAI_API_KEY=your-key (OpenAI platform থেকে key নিন)",
    };
    return NextResponse.json(
      {
        error: `"${provider}" এর জন্য API key সেট করা নেই। frontend/.env.local এ ${envHint[provider]} যোগ করুন।`,
      },
      { status: 503 },
    );
  }

  const resolved = resolveModel(provider, model);
  const examLabel = [examCategoryName, subExamCategoryName]
    .filter(Boolean)
    .join(" — ");
  const syllabusText = prepareSyllabusText(
    syllabus.content,
    syllabus.contentType,
  );

  const fullSchedule = buildSchedule(startDate, totalDays, offWeekday ?? null);

  // ─── Batched, sequential planning loop ─────────────────────────────────
  // Sequential (not parallel) on purpose: each batch needs to know what
  // earlier batches already scheduled so the whole plan stays one coherent
  // course instead of independent, possibly-overlapping day chunks.
  const allDays: {
    dayNumber: number;
    date: string;
    title: string;
    subject: string;
    topics: string;
    sourceMaterial: string;
    description: string;
    totalMarks: number;
    duration: number;
  }[] = [];
  const priorCoverage: string[] = [];
  const warnings: string[] = [];
  let fatalError: unknown = null;
  let batchNum = 0;

  for (
    let offset = 0;
    offset < fullSchedule.length && batchNum < MAX_BATCHES;
    offset += BATCH_SIZE_DAYS
  ) {
    batchNum++;
    const batchDays = fullSchedule.slice(offset, offset + BATCH_SIZE_DAYS);
    const prompt = buildPrompt({
      examLabel,
      syllabusTitle: syllabus.title,
      syllabusText,
      totalDaysOverall: totalDays,
      batchDays,
      priorCoverage,
    });
    const maxOutputTokens = Math.min(
      12000,
      Math.max(3000, batchDays.length * 320),
    );

    try {
      const { text, finishReason } = await callModelWithRotation(
        provider,
        resolved.modelString,
        prompt,
        maxOutputTokens,
      );
      const rawDays = parseDaysFromOutput(text);

      if (rawDays.length === 0) {
        console.error(
          `[routine-ai-import] batch ${batchNum} parse failed, raw output:`,
          text.slice(0, 500),
        );
        warnings.push(
          `ব্যাচ ${batchNum}: কোনো দিন পার্স করা যায়নি। raw: ${text.slice(0, 150).replace(/\s+/g, " ")}`,
        );
        break;
      }

      // Match each parsed day back to its scheduled slot by dayNumber (not
      // array position) so a shuffled/partial AI response still lines up
      // correctly with the right date.
      const byDayNumber = new Map<number, AiRoutineDay>();
      for (const raw of rawDays) {
        const check = aiDaySchema.safeParse(raw);
        if (check.success) byDayNumber.set(check.data.dayNumber, check.data);
      }

      let matchedInBatch = 0;
      for (const day of batchDays) {
        const content = byDayNumber.get(day.dayNumber);
        if (!content) continue;
        matchedInBatch++;
        allDays.push({
          dayNumber: day.dayNumber,
          date: day.date,
          title: content.title,
          subject: content.subject,
          topics: content.topics,
          sourceMaterial: content.sourceMaterial || "",
          description: content.description || "",
          totalMarks: defaultTotalMarks,
          duration: defaultDuration,
        });
        priorCoverage.push(toCoverageLine(day, content));
      }

      if (matchedInBatch < batchDays.length) {
        warnings.push(
          `ব্যাচ ${batchNum}: ${batchDays.length}টির মধ্যে ${matchedInBatch}টি দিন পাওয়া গেছে — বাকিগুলো এই রানে তৈরি হয়নি।`,
        );
      }

      if (finishReason === "length" && matchedInBatch < batchDays.length) {
        warnings.push(
          `ব্যাচ ${batchNum}: টোকেন সীমার কারণে আংশিক আউটপুট এসেছে।`,
        );
      }
    } catch (err) {
      fatalError = err;
      warnings.push(`ব্যাচ ${batchNum}: ${describeError(err)}`);
      break; // stop the loop, but keep whatever we already collected
    }
  }

  if (allDays.length === 0) {
    if (fatalError instanceof ProviderConfigError) {
      return NextResponse.json(
        { error: `${resolved.label} এর API key সঠিকভাবে সেট করা নেই।` },
        { status: 503 },
      );
    }
    if (fatalError instanceof ProviderRateLimitError) {
      const retryAfterSec = getEarliestRetryAfterSeconds(provider);
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
            ? `AI থেকে কোনো ব্যবহারযোগ্য রুটিন পাওয়া যায়নি। কারণ: ${warnings.join(" ")}`
            : "AI থেকে কোনো ব্যবহারযোগ্য রুটিন পাওয়া যায়নি। আবার চেষ্টা করুন।",
      },
      { status: 500 },
    );
  }

  if (allDays.length < fullSchedule.length) {
    warnings.push(
      `মোট ${fullSchedule.length}টি দিনের মধ্যে ${allDays.length}টি তৈরি হয়েছে — বাকিগুলোর জন্য আবার চালাতে পারেন (ইতিমধ্যে তৈরি দিনগুলো বাদ দিয়ে বাকি রেঞ্জের জন্য একটি নতুন রুটিন তৈরির অনুরোধ পাঠান)।`,
    );
  }

  return NextResponse.json({
    routines: allDays,
    count: allDays.length,
    targetCount: fullSchedule.length,
    provider: resolved.provider,
    model: resolved.modelString,
    modelLabel: resolved.label,
    warning: warnings.length > 0 ? warnings.join(" ") : undefined,
  });
}
