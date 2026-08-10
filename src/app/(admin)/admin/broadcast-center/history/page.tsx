"use client";

import { broadcastLogsApi } from "@/features/broadcast/services/broadcast.api";
import type { BroadcastLog } from "@/features/broadcast/services/broadcast.api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BroadcastHistoryPage() {
  const [rows, setRows] = useState<BroadcastLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await broadcastLogsApi.list({ limit: 50 });
        setRows(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "লোড ব্যর্থ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Broadcast History</h1>
        <Link href="/admin/broadcast-center" className="text-sm text-[#145B3D] underline">
          Compose & Send
        </Link>
      </div>

      {loading && <p>লোড হচ্ছে...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Type</th>
                <th className="p-2">Platforms</th>
                <th className="p-2">Status</th>
                <th className="p-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString("bn-BD")}
                  </td>
                  <td className="p-2">{r.contentType}</td>
                  <td className="p-2">{r.platforms.join(", ")}</td>
                  <td className="p-2">
                    <span
                      className={
                        r.status === "SENT"
                          ? "text-green-700"
                          : r.status === "FAILED"
                            ? "text-red-600"
                            : ""
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2 max-w-xs truncate">
                    {r.errorMessage ||
                      r.contentText?.slice(0, 80) ||
                      r.mediaUrl ||
                      "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-4 text-muted-foreground text-sm">কোনো broadcast log নেই।</p>
          )}
        </div>
      )}
    </div>
  );
}
