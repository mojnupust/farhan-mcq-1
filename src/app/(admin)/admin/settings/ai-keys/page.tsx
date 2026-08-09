"use client";

import { aiKeysApi } from "@/features/ai-keys/services/ai-keys.api";
import type { AiProviderKey, AiProviderName } from "@/features/ai-keys/types";
import { useEffect, useState } from "react";

const PROVIDERS: AiProviderName[] = [
  "MISTRAL",
  "ANTHROPIC",
  "GEMINI",
  "OPENAI",
  "OMNIROUTE",
];

export default function AiKeysPage() {
  const [keys, setKeys] = useState<AiProviderKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AiProviderName>("MISTRAL");
  const [keyInput, setKeyInput] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setKeys(await aiKeysApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "লোড ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!keyInput.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await aiKeysApi.create({
        provider,
        key: keyInput.trim(),
        label: label.trim() || undefined,
      });
      setKeyInput("");
      setLabel("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Key যোগ করা ব্যর্থ হয়েছে",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(k: AiProviderKey) {
    await aiKeysApi.toggleActive(k.id, !k.isActive);
    await load();
  }

  async function handleDelete(k: AiProviderKey) {
    if (
      !confirm(
        `"${k.label || k.provider}" key ডিলিট করবে? এটা undo করা যাবে না।`,
      )
    )
      return;
    await aiKeysApi.remove(k.id);
    await load();
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">AI API Key Management</h1>

      <div className="border rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex gap-3">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AiProviderName)}
            className="border rounded-lg px-3 py-2"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Label (optional, e.g. 'primary')"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border rounded-lg px-3 py-2 flex-1"
          />
        </div>
        <input
          type="password"
          placeholder="API key paste করো"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !keyInput.trim()}
          className="bg-[#145B3D] text-white rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "যোগ হচ্ছে..." : "Key যোগ করো"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <div className="space-y-2">
          {keys.length === 0 && (
            <p className="text-gray-500">এখনো কোনো key যোগ করা হয়নি।</p>
          )}
          {keys.map((k) => (
            <div
              key={k.id}
              className="border rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {k.provider}{" "}
                  {k.label && (
                    <span className="text-gray-500">— {k.label}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  {k.keyPreview}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(k)}
                  className={`text-sm px-3 py-1 rounded-full ${
                    k.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {k.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleDelete(k)}
                  className="text-sm text-red-600 px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
