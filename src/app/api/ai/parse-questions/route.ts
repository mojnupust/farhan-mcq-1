import { type NextRequest, NextResponse } from "next/server";

// gemini-2.0-flash — free tier (15 RPM, 1500 RPD). Change if needed.
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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
— Output a JSON array ONLY — no markdown, no code fences, no explanation text outside the array
— sortOrder starts at ${startSortOrder} and increments by 1 for each question
— correctAnswer must be exactly one character: "A", "B", "C", or "D"
— explanation: use \\n for newlines (valid JSON string — not literal line breaks)
— All text fields in Bengali except for English-language questions/options
— questionText for Mode B: include prefix like "০১." at the start

[
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

INPUT TEXT:
===START===
${rawText}
===END===`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY পরিবেশ পরিবর্তনশীল সেট করা নেই। frontend/.env.local এ GEMINI_API_KEY=<your-key> যোগ করুন।",
      },
      { status: 503 },
    );
  }

  let body: {
    rawText?: string;
    subjectHint?: string;
    startSortOrder?: number;
    expectedCount?: number;
    examType?: ExamType;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const {
    rawText,
    subjectHint = "",
    startSortOrder = 1,
    expectedCount = 25,
    examType = "NTRCA",
  } = body;
  if (!rawText?.trim()) {
    return NextResponse.json({ error: "rawText is required" }, { status: 400 });
  }

  const prompt = buildPrompt({
    rawText: rawText.trim(),
    subjectHint,
    startSortOrder,
    expectedCount,
    examType,
  });

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.05,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Network error calling Gemini: ${String(err)}` },
      { status: 502 },
    );
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text().catch(() => "");
    if (geminiRes.status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini API rate limit পৌঁছে গেছে (429)। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error: `Gemini API error (${geminiRes.status}): ${errBody.slice(0, 300)}`,
      },
      { status: 502 },
    );
  }

  const geminiData = (await geminiRes.json()) as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
    }[];
  };

  const rawOutput =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const finishReason = geminiData?.candidates?.[0]?.finishReason ?? "";

  if (!rawOutput) {
    return NextResponse.json(
      { error: "Gemini থেকে খালি রেসপন্স পাওয়া গেছে।" },
      { status: 500 },
    );
  }

  // Strip markdown fences if Gemini ignores responseMimeType (safety net)
  const cleaned = rawOutput
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let questions: unknown[];
  try {
    questions = JSON.parse(cleaned) as unknown[];
  } catch {
    // If truncated JSON (maxTokens hit), try to recover the partial array
    const partial = tryRecoverPartialJson(cleaned);
    if (partial.length > 0) {
      return NextResponse.json({
        questions: partial,
        count: partial.length,
        warning:
          finishReason === "MAX_TOKENS"
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
      { error: "Gemini থেকে প্রত্যাশিত JSON array পাওয়া যায়নি।" },
      { status: 500 },
    );
  }

  const warning =
    finishReason === "MAX_TOKENS"
      ? `আউটপুট সীমা পৌঁছে গেছে — ${questions.length} টি প্রশ্ন পার্স হয়েছে। বাকিগুলো পরের ব্যাচে পার্স করুন।`
      : undefined;

  return NextResponse.json({ questions, count: questions.length, warning });
}

/** Best-effort: extract complete JSON objects from a truncated array string. */
function tryRecoverPartialJson(text: string): unknown[] {
  const results: unknown[] = [];
  // Find all complete {...} blocks
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
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
