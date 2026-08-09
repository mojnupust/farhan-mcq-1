// Server-only. app/api/** route handlers Next.js এ সবসময় server-side, তাই
// এই ফাইল client bundle এ কখনো যাবে না।

type AiProviderName =
  | "MISTRAL"
  | "ANTHROPIC"
  | "GEMINI"
  | "OPENAI"
  | "OMNIROUTE";
type ResolvedKeys = Partial<Record<AiProviderName, string[]>>;

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3002"
).replace(/\/+$/, "");
const CACHE_TTL_MS = 60_000; // admin panel এ key change করলে ৬০ সেকেন্ডের মধ্যে effect হবে

let cache: { data: ResolvedKeys; fetchedAt: number } | null = null;
let inFlight: Promise<ResolvedKeys> | null = null;

async function fetchFromBackend(): Promise<ResolvedKeys> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    console.error("[ai-key-store] INTERNAL_API_SECRET not configured");
    return {};
  }
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/ai-provider-keys/resolve`, {
      headers: { "x-internal-token": secret },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[ai-key-store] backend resolve failed: ${res.status}`);
      return {};
    }
    const json = (await res.json()) as { data: ResolvedKeys };
    return json.data ?? {};
  } catch (err) {
    console.error("[ai-key-store] fetch error:", err);
    return {};
  }
}

async function getGroupedKeys(): Promise<ResolvedKeys> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.data;
  if (!inFlight)
    inFlight = fetchFromBackend().finally(() => {
      inFlight = null;
    });
  const data = await inFlight;
  cache = { data, fetchedAt: now };
  return data;
}

export async function getDbKeysForProvider(
  provider: AiProviderName,
): Promise<string[]> {
  return (await getGroupedKeys())[provider] ?? [];
}
