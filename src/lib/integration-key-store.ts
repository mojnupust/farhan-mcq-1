// Server-only — resolved Telegram/Facebook credentials from Express backend.

export type BroadcastPlatformName =
  | "TELEGRAM_GROUP"
  | "TELEGRAM_CHANNEL"
  | "FACEBOOK_PAGE"
  | "WHATSAPP";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface FacebookConfig {
  pageId: string;
  pageAccessToken: string;
  appId?: string;
  appSecret?: string;
}

export type IntegrationConfig = TelegramConfig | FacebookConfig;

type ResolvedConfigs = Partial<
  Record<BroadcastPlatformName, IntegrationConfig[]>
>;

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3002"
).replace(/\/+$/, "");
const CACHE_TTL_MS = 60_000;

let cache: { data: ResolvedConfigs; fetchedAt: number } | null = null;
let inFlight: Promise<ResolvedConfigs> | null = null;

async function fetchFromBackend(): Promise<ResolvedConfigs> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    console.error("[integration-key-store] INTERNAL_API_SECRET not configured");
    return {};
  }
  try {
    const res = await fetch(
      `${API_ORIGIN}/api/v1/integration-credentials/resolve`,
      {
        headers: { "x-internal-token": secret },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      console.error(
        `[integration-key-store] backend resolve failed: ${res.status}`,
      );
      return {};
    }
    const json = (await res.json()) as { data: ResolvedConfigs };
    return json.data ?? {};
  } catch (err) {
    console.error("[integration-key-store] fetch error:", err);
    return {};
  }
}

async function getGroupedConfigs(): Promise<ResolvedConfigs> {
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

export async function getConfigsForPlatform(
  platform: BroadcastPlatformName,
): Promise<IntegrationConfig[]> {
  return (await getGroupedConfigs())[platform] ?? [];
}

export function clearIntegrationConfigCache(): void {
  cache = null;
}
