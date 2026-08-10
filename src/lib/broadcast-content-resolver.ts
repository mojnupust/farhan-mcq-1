import { buildDefaultStyleConfig } from "@/features/slides/style-presets";
import type { NextRequest } from "next/server";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3002"
).replace(/\/+$/, "");

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;

export interface JobCircularPayload {
  id: string;
  title: string;
  organizationName: string;
  deadline: string | null;
  applicationUrl: string | null;
  logoUrl: string | null;
  salary: string | null;
}

function authHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("authorization");
  return auth ? { Authorization: auth } : {};
}

async function backendFetch(
  req: NextRequest,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${API_ORIGIN}/api${path}`, {
    ...init,
    headers: {
      ...authHeaders(req),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res;
}

export async function fetchPdfForBroadcast(
  req: NextRequest,
  pdfId: string,
): Promise<{ buffer: Buffer; fileName: string; title: string }> {
  const metaRes = await backendFetch(req, `/v1/pdfs/${pdfId}`);
  const metaJson = (await metaRes.json()) as {
    data: { title: string; fileName: string };
  };
  const dlRes = await backendFetch(req, `/v1/pdfs/${pdfId}/download`);
  const buffer = Buffer.from(await dlRes.arrayBuffer());
  return {
    buffer,
    fileName: metaJson.data.fileName || `${metaJson.data.title}.pdf`,
    title: metaJson.data.title,
  };
}

interface SlideRow {
  id: string;
  order: number;
}

async function pollSlideJob(
  req: NextRequest,
  jobId: string,
): Promise<SlideRow[]> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const res = await backendFetch(req, `/v1/slides/jobs/${jobId}`);
    const json = (await res.json()) as {
      data: { status: string; slides?: SlideRow[]; errorMessage?: string | null };
    };
    const job = json.data;
    if (job.status === "DONE" && job.slides?.length) {
      return [...job.slides].sort((a, b) => a.order - b.order);
    }
    if (job.status === "FAILED") {
      throw new Error(job.errorMessage || "Slide generation failed");
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error("Slide generation timed out");
}

async function fetchExistingSlides(
  req: NextRequest,
  questionSetId: string,
): Promise<SlideRow[]> {
  const res = await fetch(`${API_ORIGIN}/api/v1/slides/${questionSetId}`, {
    headers: authHeaders(req),
  });
  if (res.status === 404) return [];
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`slides list failed: ${text.slice(0, 150)}`);
  }
  const json = (await res.json()) as { data: { slides: SlideRow[] } | null };
  return json.data?.slides ?? [];
}

export async function fetchQuestionSetSlideImage(
  req: NextRequest,
  questionSetId: string,
): Promise<{ buffer: Buffer; slideId: string }> {
  let slides = await fetchExistingSlides(req, questionSetId);

  if (!slides.length) {
    const genRes = await backendFetch(req, "/v1/slides/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionSetId,
        styleConfig: buildDefaultStyleConfig(),
      }),
    });
    const genJson = (await genRes.json()) as {
      data: { cached?: boolean; slides?: SlideRow[]; jobId?: string };
    };
    if (genJson.data.cached && genJson.data.slides?.length) {
      slides = genJson.data.slides;
    } else if (genJson.data.jobId) {
      slides = await pollSlideJob(req, genJson.data.jobId);
    } else {
      throw new Error("Slide generation returned no job or slides");
    }
  }

  const first = [...slides].sort((a, b) => a.order - b.order)[0];
  if (!first) throw new Error("No slides available for question set");

  const imgRes = await backendFetch(req, `/v1/slides/${first.id}/download`);
  return {
    buffer: Buffer.from(await imgRes.arrayBuffer()),
    slideId: first.id,
  };
}

export async function fetchJobCircular(
  req: NextRequest,
  id: string,
): Promise<JobCircularPayload> {
  const res = await backendFetch(req, `/v1/job-circulars/${id}`);
  const json = (await res.json()) as { data: JobCircularPayload };
  return json.data;
}

export function buildJobCircularCaption(c: JobCircularPayload): string {
  const deadline = c.deadline
    ? new Date(c.deadline).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "উল্লেখ নেই";
  const lines = [
    `${c.title} — ${c.organizationName}`,
    `আবেদনের শেষ তারিখ: ${deadline}`,
  ];
  if (c.salary) lines.push(`বেতন/স্কেল: ${c.salary}`);
  if (c.applicationUrl) lines.push(`আবেদন: ${c.applicationUrl}`);
  lines.push("", "#FarhanMCQ #JobCircular #BCS_প্রস্তুতি");
  return lines.join("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
