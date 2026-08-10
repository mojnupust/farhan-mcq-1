"use client";

import { authHeader } from "@/lib/auth-header";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { automationRulesApi } from "@/features/broadcast/services/automation-rules.api";
import type { AutomationRule } from "@/features/broadcast/services/automation-rules.api";

const PLATFORMS = [
  { id: "TELEGRAM_GROUP", label: "Telegram group" },
  { id: "TELEGRAM_CHANNEL", label: "Telegram channel" },
  { id: "FACEBOOK_PAGE", label: "Facebook page" },
] as const;

export default function BroadcastRulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  const [name, setName] = useState("Daily random MCQs");
  const [questionCount, setQuestionCount] = useState(3);
  const [intervalMinutes, setIntervalMinutes] = useState(120);
  const [platforms, setPlatforms] = useState<string[]>(["TELEGRAM_GROUP"]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRules(await automationRulesApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function togglePlatform(id: string) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleCreate(active: boolean) {
    if (!name.trim() || platforms.length === 0) {
      setError("Name and at least one platform required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await automationRulesApi.create({
        name: name.trim(),
        platforms: platforms as AutomationRule["platforms"],
        questionCount,
        intervalMinutes,
        isActive: active,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(rule: AutomationRule) {
    try {
      await automationRulesApi.update(rule.id, { isActive: !rule.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleRunNow(rule: AutomationRule) {
    if (!confirm("Run this rule now? Posts will go to live channels.")) return;
    setRunningId(rule.id);
    try {
      const result = await automationRulesApi.runNow(rule.id);
      setError(null);
      alert(`Done: ${result.sent} sent, ${result.failed} failed`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunningId(null);
    }
  }

  async function handleDelete(rule: AutomationRule) {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    await automationRulesApi.remove(rule.id);
    await load();
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-xl font-semibold">Automation Rules</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/broadcast-center" className="text-[#145B3D] underline">
            Compose
          </Link>
          <Link href="/admin/broadcast-center/history" className="text-[#145B3D] underline">
            History
          </Link>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Phase 3: BullMQ sends {questionCount} random questions on a schedule. Worker must be
        running: <code className="text-xs">npm run worker:dev</code>
      </p>

      <section className="border rounded-2xl p-4 space-y-3">
        <p className="font-medium text-sm">New rule — random questions</p>
        <input
          className="border rounded-lg px-3 py-2 w-full text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rule name"
        />
        <div className="flex flex-wrap gap-4 text-sm">
          <label>
            Questions per run{" "}
            <input
              type="number"
              min={1}
              max={4}
              className="border rounded w-16 ml-1 px-2"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            />
          </label>
          <label>
            Every (minutes){" "}
            <input
              type="number"
              min={2}
              className="border rounded w-20 ml-1 px-2"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
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
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleCreate(false)}
            className="border rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            Save (off)
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleCreate(true)}
            className="bg-[#145B3D] text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            Save &amp; enable
          </button>
        </div>
      </section>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <ul className="space-y-3">
        {rules.map((rule) => (
          <li key={rule.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-xs text-muted-foreground">
                  {rule.questionCount} questions · every {rule.intervalMinutes} min ·{" "}
                  {rule.platforms.join(", ")}
                </p>
                {rule.lastRunAt && (
                  <p className="text-xs text-muted-foreground">
                    Last run: {new Date(rule.lastRunAt).toLocaleString("bn-BD")}
                  </p>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  rule.isActive ? "bg-green-100 text-green-800" : "bg-muted"
                }`}
              >
                {rule.isActive ? "Active" : "Off"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="text-sm border rounded-lg px-3 py-1"
                onClick={() => handleToggle(rule)}
              >
                {rule.isActive ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                className="text-sm border rounded-lg px-3 py-1"
                disabled={runningId === rule.id}
                onClick={() => handleRunNow(rule)}
              >
                {runningId === rule.id ? "Running..." : "Run now"}
              </button>
              <button
                type="button"
                className="text-sm text-red-600 border rounded-lg px-3 py-1"
                onClick={() => handleDelete(rule)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {!loading && rules.length === 0 && (
          <p className="text-sm text-muted-foreground">No automation rules yet.</p>
        )}
      </ul>
    </div>
  );
}
