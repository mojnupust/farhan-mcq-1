"use client";

import { authHeader } from "@/lib/auth-header";
import { useState } from "react";

export type BroadcastPlatform =
  | "TELEGRAM_GROUP"
  | "TELEGRAM_CHANNEL"
  | "FACEBOOK_PAGE";

const PLATFORMS: { id: BroadcastPlatform; label: string }[] = [
  { id: "TELEGRAM_GROUP", label: "Telegram group" },
  { id: "TELEGRAM_CHANNEL", label: "Telegram channel" },
  { id: "FACEBOOK_PAGE", label: "Facebook page" },
];

export interface BroadcastSendPayload {
  platforms: BroadcastPlatform[];
  contentType: string;
  contentText?: string;
  caption?: string;
  pdfId?: string;
  questionSetId?: string;
  jobCircularIds?: string[];
  aiProvider?: string;
  aiModel?: string;
}

interface BroadcastSendDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  payload: Omit<BroadcastSendPayload, "platforms">;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function BroadcastSendDialog({
  open,
  onClose,
  title,
  description,
  payload,
  onSuccess,
  onError,
}: BroadcastSendDialogProps) {
  const [platforms, setPlatforms] = useState<BroadcastPlatform[]>([
    "TELEGRAM_GROUP",
  ]);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  function togglePlatform(p: BroadcastPlatform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function handleSend() {
    if (platforms.length === 0) {
      onError?.("কমপক্ষে একটি platform নির্বাচন করুন");
      return;
    }
    if (
      !confirm(
        "নির্বাচিত চ্যানেলে পোস্ট পাঠানো হবে। চালিয়ে যাবেন?",
      )
    ) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/automation/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ ...payload, platforms }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        results?: { platform: string; status: string; error?: string }[];
      };
      if (!res.ok && !json.results) {
        throw new Error(json.error || "Send failed");
      }
      const failed = json.results?.filter((r) => r.status === "FAILED") ?? [];
      if (failed.length) {
        onError?.(
          failed.map((f) => `${f.platform}: ${f.error}`).join("; "),
        );
      } else {
        onSuccess?.("Broadcast সফল — History তে দেখুন");
        onClose();
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background border rounded-2xl shadow-lg max-w-md w-full p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Platforms</p>
          {PLATFORMS.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={platforms.includes(p.id)}
                onChange={() => togglePlatform(p.id)}
              />
              {p.label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="border rounded-lg px-4 py-2 text-sm"
            onClick={onClose}
            disabled={sending}
          >
            বাতিল
          </button>
          <button
            type="button"
            className="bg-[#145B3D] text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "পাঠানো হচ্ছে..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
