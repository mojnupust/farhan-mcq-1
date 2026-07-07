import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const UPSTREAM_BASE = "https://api-farhan-mcq.onrender.com/api/v1";

async function proxyUpstream(
  req: Request,
  res: Response,
  upstreamPath: string,
  opts: RequestInit = {},
): Promise<void> {
  const authHeader = req.headers.authorization;
  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (authHeader) {
    fetchHeaders["Authorization"] = authHeader;
  }

  let upstreamRes: globalThis.Response;
  try {
    upstreamRes = await fetch(`${UPSTREAM_BASE}${upstreamPath}`, {
      ...opts,
      headers: fetchHeaders,
    });
  } catch (err) {
    req.log.error({ err, upstreamPath }, "Upstream fetch failed");
    res.status(502).json({ error: "Upstream service unavailable" });
    return;
  }

  let data: unknown;
  const contentType = upstreamRes.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      data = await upstreamRes.json();
    } catch (err) {
      req.log.error({ err, upstreamPath }, "Failed to parse upstream JSON");
      res.status(502).json({ error: "Invalid response from upstream" });
      return;
    }
  } else {
    const text = await upstreamRes.text();
    data = { error: text || upstreamRes.statusText };
  }

  res.status(upstreamRes.status).json(data);
}

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  await proxyUpstream(req, res, "/auth/login", {
    method: "POST",
    body: JSON.stringify(req.body),
  });
});

// GET /api/exam-categories
router.get("/exam-categories", async (req, res): Promise<void> => {
  await proxyUpstream(req, res, "/exam-categories");
});

// GET /api/question-sets  → proxies to /question-sets/live (all question sets, auth required)
router.get("/question-sets", async (req, res): Promise<void> => {
  await proxyUpstream(req, res, "/question-sets/live");
});

// GET /api/question-sets/:questionSetId/questions
router.get(
  "/question-sets/:questionSetId/questions",
  async (req, res): Promise<void> => {
    const raw = req.params.questionSetId;
    const id = Array.isArray(raw) ? raw[0] : raw;
    await proxyUpstream(
      req,
      res,
      `/question-sets/exam-questions/${encodeURIComponent(id)}`,
    );
  },
);

export default router;
