import { isProviderConfigured, listCatalog } from "@/lib/ai-model-catalog";
import { NextResponse } from "next/server";

// Everything the AI-import model picker needs in one call: the static
// catalog of officially-integrated models (shown even if not configured
// yet, so the admin can see what's coming and knows what key to add) plus
// OmniRoute's own live model list (fetched from ITS /v1/models — that
// catalog changes as the admin connects/disconnects providers inside
// OmniRoute, so it can't be a static list like the others).

const OMNIROUTE_BASE_URL = (
  process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1"
).replace(/\/+$/, "");

const CACHE_TTL_MS = 5 * 60_000;
let omniModelsCache: { models: string[]; fetchedAt: number } | null = null;

async function fetchOmniRouteModels(): Promise<string[]> {
  if (!isProviderConfigured("omniroute")) return [];
  if (
    omniModelsCache &&
    Date.now() - omniModelsCache.fetchedAt < CACHE_TTL_MS
  ) {
    return omniModelsCache.models;
  }

  const rawKeys =
    process.env.OMNIROUTE_API_KEYS ??
    process.env.OMNIROUTE_API_KEY ??
    "omniroute-local-key";
  const key =
    rawKeys
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)[0] || "omniroute-local-key";

  try {
    const res = await fetch(`${OMNIROUTE_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return omniModelsCache?.models ?? [];

    const data = (await res.json()) as { data?: { id?: string }[] };
    const models = (data.data ?? [])
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id))
      .sort();

    omniModelsCache = { models, fetchedAt: Date.now() };
    return models;
  } catch {
    return omniModelsCache?.models ?? [];
  }
}

export async function GET() {
  const omniModels = await fetchOmniRouteModels();

  return NextResponse.json({
    options: [
      ...listCatalog(),
      {
        id: "omniroute",
        provider: "omniroute" as const,
        label: "Local (OmniRoute)",
        available: isProviderConfigured("omniroute"),
        subModels: omniModels,
      },
    ],
  });
}
