import { type NextRequest, NextResponse } from "next/server";

// gemini-2.0-flash — free tier (15 RPM, 1500 RPD). Change if needed.
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(
  rawText: string,
  subjectHint: string,
  startSortOrder: number,
): string {
  return `You are an expert at parsing Bangladesh public exam MCQ questions (BCS, NTRCA, Primary, etc.) from messy OCR or raw text.

Your task: Extract ALL MCQ questions from the input text and return them as a JSON array.

PARSING RULES:
1. Each MCQ has question text + exactly 4 options + correct answer
2. Detect the correct answer from:
   - "উ. ক" or "উঃ ক" → A | "উ. খ" → B | "উ. গ" → C | "উ. ঘ" → D
   - "উত্তর: (ক)" → A, etc.
   - Option order in text = A, B, C, D regardless of bullet symbol
3. Strip option bullet symbols: @, ©, ®, ¬, •, ○, ●, (ক), (খ), (গ), (ঘ), ক., খ.
4. Strip question number prefixes: "১.", "০১.", "1.", "(১)", "Q1." etc. from questionText
5. Explanation:
   - If "ব্যাখ্যা:" section exists → use it AND elaborate it
   - If absent → generate a comprehensive explanation
   - Always start explanation with: "সঠিক উত্তর: (X) [answer text]\\n\\n"
     where X is ক/খ/গ/ঘ matching the correctAnswer
   - Then write 5-8 lines: context, key facts, why wrong options are wrong, sources
6. Subject: "${subjectHint || "auto-detect (বাংলা ভাষা ও সাহিত্য / ইংরেজি / গণিত / সাধারণ জ্ঞান / বাংলাদেশ ও বিশ্বপরিচয়)"}"
7. Auto-detect topic and subTopic from the question content
8. sortOrder starts from ${startSortOrder} and increments by 1
9. SKIP non-question content: page headers, decorative lines, grammar tables (not part of a question), QR codes, app ads

OUTPUT: A JSON array ONLY — no markdown, no code fences, no explanation outside the array.
[
  {
    "questionText": "string — clean, no number prefix",
    "optionA": "string",
    "optionB": "string",
    "optionC": "string",
    "optionD": "string",
    "correctAnswer": "A" | "B" | "C" | "D",
    "explanation": "string — elaborate Bengali explanation",
    "subject": "string — Bengali",
    "topic": "string — Bengali",
    "subTopic": "string — Bengali",
    "sortOrder": number
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

  let body: { rawText?: string; subjectHint?: string; startSortOrder?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { rawText, subjectHint = "", startSortOrder = 1 } = body;
  if (!rawText?.trim()) {
    return NextResponse.json({ error: "rawText is required" }, { status: 400 });
  }

  const prompt = buildPrompt(rawText.trim(), subjectHint, startSortOrder);

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
