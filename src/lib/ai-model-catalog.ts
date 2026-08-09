// Shared AI model registry for question generation.
//
// Each model the admin can pick from calls its OWN official API directly:
//   - Mistral        → Mistral's official chat/completions API
//   - Claude Opus/Sonnet → Anthropic's official Messages API (/v1/messages)
//   - Gemini Pro     → Google's official generateContent API
//   - OmniRoute      → a self-hosted local gateway (OpenAI-compatible),
//                      used only for its own free/local models — never as a
//                      proxy for the official Anthropic/Gemini integrations
//                      above, which are separate, direct integrations.
//
// Adding a new officially-supported model later (e.g. a new Claude or GPT
// release) means adding one entry to CATALOG below — no route/UI rewiring.

import { getDbKeysForProvider } from "./ai-key-store";

export type AiProviderId =
  | "mistral"
  | "omniroute"
  | "anthropic"
  | "gemini"
  | "openai";

export type NormalizedFinishReason = "stop" | "length" | "other";

export interface CallResult {
  text: string;
  finishReason: NormalizedFinishReason;
}

// ─── Per-provider key pools (round-robin + rate-limit cooldown) ─────────────

interface KeySlot {
  key: string;
  lastUsedAt: number;
  rateLimitedUntil: number;
}

// Key-string ধরে metadata persist করে রাখি, যাতে DB/env থেকে key list refresh
// হলেও rate-limit cooldown আর round-robin fairness হারিয়ে না যায়।
const slotMetaByKey = new Map<string, KeySlot>();

function toSlots(keys: string[]): KeySlot[] {
  return keys.map((key) => {
    const existing = slotMetaByKey.get(key);
    if (existing) return existing;
    const fresh: KeySlot = { key, lastUsedAt: 0, rateLimitedUntil: 0 };
    slotMetaByKey.set(key, fresh);
    return fresh;
  });
}

const DB_PROVIDER_NAME: Record<
  AiProviderId,
  "MISTRAL" | "ANTHROPIC" | "GEMINI" | "OPENAI" | "OMNIROUTE"
> = {
  mistral: "MISTRAL",
  anthropic: "ANTHROPIC",
  gemini: "GEMINI",
  openai: "OPENAI",
  omniroute: "OMNIROUTE",
};

function envKeysFor(provider: AiProviderId): string[] {
  const raw = (() => {
    switch (provider) {
      case "mistral":
        return (
          process.env.MISTRAL_API_KEYS ?? process.env.MISTRAL_API_KEY ?? ""
        );
      case "omniroute":
        return process.env.OMNIROUTE_API_KEY || "";
      case "anthropic":
        return (
          process.env.ANTHROPIC_API_KEYS ?? process.env.ANTHROPIC_API_KEY ?? ""
        );
      case "gemini":
        return process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY ?? "";
      case "openai":
        return process.env.OPENAI_API_KEYS ?? process.env.OPENAI_API_KEY ?? "";
    }
  })();
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function getKeyPool(provider: AiProviderId): Promise<KeySlot[]> {
  const [envKeys, dbKeys] = await Promise.all([
    Promise.resolve(envKeysFor(provider)),
    getDbKeysForProvider(DB_PROVIDER_NAME[provider]),
  ]);
  // .env.local আর admin panel দুই জায়গাতেই একই key থাকলে dedupe করো
  let merged = Array.from(new Set([...dbKeys, ...envKeys]));
  // OmniRoute self-hosted local gateway — key ছাড়াও চলে, তাই আগের মতোই fallback রাখলাম
  if (provider === "omniroute" && merged.length === 0) merged = ["omniroute"];
  return toSlots(merged);
}

export async function isProviderConfigured(
  provider: AiProviderId,
): Promise<boolean> {
  return (await getKeyPool(provider)).length > 0;
}

/** model-catalog route এ OmniRoute /models list করার জন্য ব্যবহার হয়। */
export async function getFirstAvailableKey(
  provider: AiProviderId,
): Promise<string | null> {
  const pool = await getKeyPool(provider);
  return pool[0]?.key ?? null;
}

function pickAvailableKey(pool: KeySlot[]): KeySlot | null {
  const now = Date.now();
  const available = pool.filter((s) => s.rateLimitedUntil <= now);
  if (available.length === 0) return null;
  available.sort((a, b) => a.lastUsedAt - b.lastUsedAt);
  return available[0];
}

export async function getEarliestRetryAfterSeconds(
  provider: AiProviderId,
): Promise<number> {
  const pool = await getKeyPool(provider);
  const now = Date.now();
  const soonest =
    pool.length > 0
      ? Math.min(...pool.map((s) => s.rateLimitedUntil))
      : now + 60_000;
  return Math.max(1, Math.ceil((soonest - now) / 1000));
}

export class ProviderConfigError extends Error {
  provider: AiProviderId;
  constructor(provider: AiProviderId) {
    super(`${provider} not configured`);
    this.provider = provider;
  }
}
export class ProviderRateLimitError extends Error {
  provider: AiProviderId;
  constructor(provider: AiProviderId) {
    super(`${provider} rate limited`);
    this.provider = provider;
  }
}
export class ProviderApiError extends Error {
  provider: AiProviderId;
  status: number;
  body: string;
  constructor(provider: AiProviderId, status: number, body: string) {
    super(`${provider} API error (${status})`);
    this.provider = provider;
    this.status = status;
    this.body = body;
  }
}

// ─── Model catalog ───────────────────────────────────────────────────────────
// Every officially-integrated model the admin can pick, shown in the UI
// whether or not its key is configured yet (so it's visible + ready to
// switch on the moment a key is added). OmniRoute is intentionally NOT in
// this static list — its models come live from its own /v1/models catalog
// (see the model-catalog route) since that list changes as the admin
// connects/disconnects providers inside OmniRoute itself.

export interface ModelCatalogEntry {
  id: string; // sent from the client as `model`
  provider: AiProviderId;
  label: string;
  resolveModelString: () => string;
}

const CATALOG: ModelCatalogEntry[] = [
  {
    id: "mistral-large",
    provider: "mistral",
    label: "Mistral Large (cloud)",
    resolveModelString: () =>
      process.env.MISTRAL_MODEL || "mistral-large-latest",
  },
  {
    id: "claude-opus-4-8",
    provider: "anthropic",
    label: "Claude Opus 4.8",
    resolveModelString: () =>
      process.env.ANTHROPIC_MODEL_OPUS || "claude-opus-4-8",
  },
  {
    id: "claude-sonnet-5",
    provider: "anthropic",
    label: "Claude Sonnet 5",
    resolveModelString: () =>
      process.env.ANTHROPIC_MODEL_SONNET || "claude-sonnet-5",
  },
  {
    id: "gemini-pro-3-1",
    provider: "gemini",
    label: "Gemini Pro 3.1",
    resolveModelString: () => process.env.GEMINI_MODEL || "gemini-pro-3.1",
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    label: "OpenAI GPT-4o Mini",
    resolveModelString: () => process.env.OPENAI_MODEL_MINI || "gpt-4o-mini",
  },
  {
    id: "gpt-4o",
    provider: "openai",
    label: "OpenAI GPT-4o",
    resolveModelString: () => process.env.OPENAI_MODEL || "gpt-4o",
  },
];

export async function listCatalog(): Promise<
  { id: string; provider: AiProviderId; label: string; available: boolean }[]
> {
  return Promise.all(
    CATALOG.map(async (entry) => ({
      id: entry.id,
      provider: entry.provider,
      label: entry.label,
      available: await isProviderConfigured(entry.provider),
    })),
  );
}

function findCatalogEntry(id: string): ModelCatalogEntry | undefined {
  return CATALOG.find((e) => e.id === id);
}

/**
 * Resolve a client-supplied (provider, modelId) pair to the exact API model
 * string to send. For "omniroute", modelId is whatever the admin picked
 * from OmniRoute's own live catalog (or "auto"); for everything else it's
 * one of the CATALOG ids above.
 */
export function resolveModel(
  provider: AiProviderId,
  modelId?: string | null,
): { provider: AiProviderId; modelString: string; label: string } {
  if (provider === "omniroute") {
    return {
      provider,
      modelString: modelId?.trim() || process.env.OMNIROUTE_MODEL || "auto",
      label: "OmniRoute",
    };
  }
  const entry = modelId ? findCatalogEntry(modelId) : undefined;
  if (entry && entry.provider === provider) {
    return {
      provider,
      modelString: entry.resolveModelString(),
      label: entry.label,
    };
  }
  const fallback = CATALOG.find((e) => e.provider === provider);
  if (fallback) {
    return {
      provider,
      modelString: fallback.resolveModelString(),
      label: fallback.label,
    };
  }
  throw new ProviderConfigError(provider);
}

// ─── Per-provider request/response adapters ─────────────────────────────────
// Each provider has its own official wire format — this is exactly the part
// that must NOT be flattened into one "OpenAI-shaped" call, since Anthropic
// and Gemini are not OpenAI-compatible.

interface AdapterRequest {
  url: string;
  init: RequestInit;
}

function buildRequest(
  provider: AiProviderId,
  key: string,
  modelString: string,
  prompt: string,
  maxOutputTokens: number,
): AdapterRequest {
  switch (provider) {
    case "mistral":
      return {
        url: "https://api.mistral.ai/v1/chat/completions",
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key || "omniroute"}`,
          },
          body: JSON.stringify({
            model: modelString || "auto",
            temperature: 0.15,
            messages: [{ role: "user", content: prompt }],
          }),
        },
      };

    case "omniroute": {
      const base = (
        process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1"
      ).replace(/\/+$/, "");
      return {
        url: `${base}/chat/completions`,
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: modelString,
            max_tokens: maxOutputTokens,
            temperature: 0.15,
            top_p: 0.95,
            stream: false,
            // Not all 290+ OmniRoute backends honor json_object mode — rely
            // on prompt instructions + robust parsing instead.
            messages: [{ role: "user", content: prompt }],
          }),
        },
      };
    }

    case "openai":
      return {
        url: "https://api.openai.com/v1/chat/completions",
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: modelString,
            max_tokens: maxOutputTokens,
            temperature: 0.15,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
        },
      };

    case "anthropic":
      // Official Anthropic Messages API — a different wire format from
      // OpenAI-style chat/completions (x-api-key header, `content` blocks
      // in the response, `stop_reason` instead of `finish_reason`).
      return {
        url: "https://api.anthropic.com/v1/messages",
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: modelString,
            max_tokens: maxOutputTokens,
            temperature: 0.15,
            messages: [{ role: "user", content: prompt }],
          }),
        },
      };

    case "gemini":
      // Official Google Generative Language API — key goes in the URL,
      // request/response shape is `contents`/`candidates`, not `messages`/
      // `choices`.
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${modelString}:generateContent?key=${key}`,
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.15,
              topP: 0.95,
              maxOutputTokens,
              responseMimeType: "application/json",
            },
          }),
        },
      };
  }
}

function parseResponse(provider: AiProviderId, json: unknown): CallResult {
  if (provider === "anthropic") {
    const data = json as {
      content?: { type?: string; text?: string }[];
      stop_reason?: string;
    };
    const text = (data.content ?? [])
      .filter((b) => b?.type === "text")
      .map((b) => b.text ?? "")
      .join("");
    const stop = data.stop_reason ?? "";
    return {
      text,
      finishReason: stop === "max_tokens" ? "length" : stop ? "stop" : "other",
    };
  }

  if (provider === "gemini") {
    const data = json as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
        finishReason?: string;
      }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const reason = data.candidates?.[0]?.finishReason ?? "";
    return {
      text,
      finishReason:
        reason === "MAX_TOKENS" ? "length" : reason ? "stop" : "other",
    };
  }

  // mistral / omniroute — both OpenAI-compatible chat/completions shape
  const data = json as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const reason = data.choices?.[0]?.finish_reason ?? "";
  return {
    text,
    finishReason: reason === "length" ? "length" : reason ? "stop" : "other",
  };
}

export async function callModelWithRotation(
  provider: AiProviderId,
  modelString: string,
  prompt: string,
  maxOutputTokens: number,
): Promise<CallResult> {
  const pool = await getKeyPool(provider);
  if (pool.length === 0) throw new ProviderConfigError(provider);

  let lastError: unknown = null;

  for (let attempt = 0; attempt < pool.length; attempt++) {
    const slot = pickAvailableKey(pool);
    if (!slot) break; // every key for this provider is currently cooling down

    slot.lastUsedAt = Date.now();
    const { url, init } = buildRequest(
      provider,
      slot.key,
      modelString,
      prompt,
      maxOutputTokens,
    );

    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (err) {
      lastError = err;
      continue;
    }

    if (res.status === 429) {
      const retryAfterHeader = res.headers.get("Retry-After");
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : 60_000;
      slot.rateLimitedUntil =
        Date.now() + (Number.isFinite(retryAfterMs) ? retryAfterMs : 60_000);
      lastError = new ProviderRateLimitError(provider);
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      slot.rateLimitedUntil = Date.now() + 24 * 60 * 60 * 1000;
      lastError = new ProviderApiError(
        provider,
        res.status,
        await res.text().catch(() => ""),
      );
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ProviderApiError(provider, res.status, body);
    }
    const json = await res.json();
    const result = parseResponse(provider, json);
    if (!result.text)
      throw new Error(`EMPTY_RESPONSE: ${JSON.stringify(json).slice(0, 300)}`);
    return result;
  }

  if (lastError instanceof ProviderApiError) throw lastError;
  throw new ProviderRateLimitError(provider);
}
