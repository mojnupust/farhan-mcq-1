"use client";

import { integrationCredentialsApi } from "@/features/integration-credentials/services/integration-credentials.api";
import type {
  BroadcastPlatformName,
  IntegrationCredential,
} from "@/features/integration-credentials/services/integration-credentials.api";
import { useEffect, useState } from "react";
import Link from "next/link";

const PLATFORMS: BroadcastPlatformName[] = [
  "TELEGRAM_GROUP",
  "TELEGRAM_CHANNEL",
  "FACEBOOK_PAGE",
];

export default function BroadcastIntegrationsPage() {
  const [items, setItems] = useState<IntegrationCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] =
    useState<BroadcastPlatformName>("TELEGRAM_GROUP");
  const [label, setLabel] = useState("");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [pageId, setPageId] = useState("");
  const [pageAccessToken, setPageAccessToken] = useState("");
  const [saving, setSaving] = useState(false);

  const isTelegram =
    platform === "TELEGRAM_GROUP" || platform === "TELEGRAM_CHANNEL";

  async function load() {
    setLoading(true);
    try {
      setItems(await integrationCredentialsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "লোড ব্যর্থ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    try {
      await integrationCredentialsApi.create({
        platform,
        label: label.trim() || undefined,
        config: isTelegram
          ? { botToken: botToken.trim(), chatId: chatId.trim() }
          : {
              pageId: pageId.trim(),
              pageAccessToken: pageAccessToken.trim(),
            },
      });
      setBotToken("");
      setChatId("");
      setPageId("");
      setPageAccessToken("");
      setLabel("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "যোগ করা ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(row: IntegrationCredential) {
    await integrationCredentialsApi.toggleActive(row.id, !row.isActive);
    await load();
  }

  async function handleDelete(row: IntegrationCredential) {
    if (!confirm("এই credential ডিলিট করবেন?")) return;
    await integrationCredentialsApi.remove(row.id);
    await load();
  }

  const canSave = isTelegram
    ? botToken.trim() && chatId.trim()
    : pageId.trim() && pageAccessToken.trim();

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Broadcast Integrations</h1>
        <Link href="/admin/broadcast-center" className="text-sm text-[#145B3D] underline">
          Compose & Send
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Telegram bot token ও Facebook page token এখানে encrypted সংরক্ষিত হয়। Raw token UI-তে
        দেখানো হয় না।
      </p>

      <div className="border rounded-2xl p-4 space-y-3">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as BroadcastPlatformName)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        {isTelegram ? (
          <>
            <input
              type="password"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Bot token"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Chat ID (group/channel)"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Facebook Page ID"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            />
            <input
              type="password"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Page access token"
              value={pageAccessToken}
              onChange={(e) => setPageAccessToken(e.target.value)}
            />
          </>
        )}
        <button
          type="button"
          disabled={saving || !canSave}
          onClick={handleAdd}
          className="bg-[#145B3D] text-white rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "সংরক্ষণ..." : "Credential যোগ করুন"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <ul className="space-y-2">
          {items.map((row) => (
            <li
              key={row.id}
              className="border rounded-xl p-3 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="font-medium">{row.platform}</p>
                <p className="text-xs text-muted-foreground">{row.configPreview}</p>
                {row.label && (
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm border rounded-lg px-3 py-1"
                  onClick={() => handleToggle(row)}
                >
                  {row.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600 border rounded-lg px-3 py-1"
                  onClick={() => handleDelete(row)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">এখনো কোনো credential নেই।</p>
          )}
        </ul>
      )}
    </div>
  );
}
