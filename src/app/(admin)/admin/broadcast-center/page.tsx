"use client";

import { pdfService } from "@/features/pdfs";
import type { PdfDocument } from "@/features/pdfs/types";
import { examCategoryService } from "@/features/exam-categories";
import type { ExamCategory } from "@/features/exam-categories";
import { questionSetService } from "@/features/question-sets";
import type { QuestionSet } from "@/features/question-sets";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { authHeader } from "@/lib/auth-header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AiProvider = "mistral" | "omniroute" | "anthropic" | "gemini" | "openai";

type Tab = "text" | "pdf" | "question-set";

type TextContentType =
  | "MOTIVATIONAL"
  | "STUDY_TIP"
  | "NOTICE"
  | "OFFER"
  | "CUSTOM";

type Platform = "TELEGRAM_GROUP" | "TELEGRAM_CHANNEL" | "FACEBOOK_PAGE";

interface ModelOption {
  id: string;
  provider: AiProvider;
  label: string;
  available: boolean;
  subModels?: string[];
}

const TEXT_TYPES: { id: TextContentType; label: string; postType: string }[] = [
  { id: "MOTIVATIONAL", label: "Motivational", postType: "motivational" },
  { id: "STUDY_TIP", label: "Study tip", postType: "study-tip" },
  { id: "NOTICE", label: "Notice", postType: "notice" },
  { id: "OFFER", label: "Offer", postType: "offer" },
  { id: "CUSTOM", label: "Custom", postType: "custom" },
];

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "TELEGRAM_GROUP", label: "Telegram group" },
  { id: "TELEGRAM_CHANNEL", label: "Telegram channel" },
  { id: "FACEBOOK_PAGE", label: "Facebook page" },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "text", label: "AI / Text post" },
  { id: "pdf", label: "PDF (syllabus)" },
  { id: "question-set", label: "Question set" },
];

export default function BroadcastCenterPage() {
  const [tab, setTab] = useState<Tab>("text");
  const [contentType, setContentType] = useState<TextContentType>("MOTIVATIONAL");
  const [platforms, setPlatforms] = useState<Platform[]>(["TELEGRAM_GROUP"]);
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [provider, setProvider] = useState<AiProvider>("mistral");
  const [modelId, setModelId] = useState<string | undefined>();
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [pdfId, setPdfId] = useState("");
  const [pdfCaption, setPdfCaption] = useState("");

  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [examSlug, setExamSlug] = useState("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [subCategorySlug, setSubCategorySlug] = useState("");
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [questionSetId, setQuestionSetId] = useState("");
  const [slideCaption, setSlideCaption] = useState("");

  const selectedMeta = useMemo(
    () => TEXT_TYPES.find((c) => c.id === contentType)!,
    [contentType],
  );

  const omnirouteSubmodels = useMemo(
    () => models.find((m) => m.provider === "omniroute")?.subModels ?? [],
    [models],
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ai/model-catalog", { headers: authHeader() });
        if (!res.ok) return;
        const json = (await res.json()) as { models?: ModelOption[] };
        const list = json.models ?? [];
        setModels(list);
        const first = list.find((m) => m.available);
        if (first) {
          setProvider(first.provider);
          setModelId(first.id);
        }
      } catch {
        /* optional */
      }
    })();
  }, []);

  useEffect(() => {
    if (tab !== "pdf") return;
    pdfService
      .adminGetAll({ limit: 50 })
      .then((r) => setPdfs(r.data))
      .catch(() => setError("PDF list load failed"));
  }, [tab]);

  useEffect(() => {
    examCategoryService.getAll().then(setExamCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!examSlug) {
      setSubCategories([]);
      setSubCategorySlug("");
      return;
    }
    subExamCategoryService
      .getByCategorySlug(examSlug)
      .then(setSubCategories)
      .catch(() => setSubCategories([]));
  }, [examSlug]);

  useEffect(() => {
    if (!subCategorySlug) {
      setQuestionSets([]);
      setQuestionSetId("");
      return;
    }
    questionSetService
      .getAllBySubCategorySlug(subCategorySlug)
      .then(setQuestionSets)
      .catch(() => setQuestionSets([]));
  }, [subCategorySlug]);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/automation/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          postType: selectedMeta.postType,
          provider,
          model: modelId,
          context: context.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { draft?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "Generate failed");
      setDraft(json.draft ?? "");
      setMessage("AI draft তৈরি হয়েছে");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setGenerating(false);
    }
  }

  async function postSend(body: Record<string, unknown>) {
    if (platforms.length === 0) {
      setError("কমপক্ষে একটি platform নির্বাচন করুন");
      return;
    }
    if (
      !confirm(
        "এই কনটেন্ট নির্বাচিত Telegram/Facebook চ্যানেলে পাঠানো হবে। চালিয়ে যাবেন?",
      )
    ) {
      return;
    }

    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/automation/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
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
        setError(
          `কিছু platform ব্যর্থ: ${failed.map((f) => `${f.platform}: ${f.error}`).join("; ")}`,
        );
      } else {
        setMessage("সফলভাবে পাঠানো হয়েছে — History তে দেখুন");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleSendText() {
    if (!draft.trim()) {
      setError("পোস্টের টেক্সট লিখুন বা AI দিয়ে তৈরি করুন");
      return;
    }
    await postSend({
      platforms,
      contentType,
      contentText: draft.trim(),
      aiProvider: provider,
      aiModel: modelId,
    });
  }

  async function handleSendPdf() {
    if (!pdfId) {
      setError("একটি PDF নির্বাচন করুন");
      return;
    }
    await postSend({
      platforms,
      contentType: "PDF",
      pdfId,
      caption: pdfCaption.trim() || undefined,
    });
  }

  async function handleSendQuestionSet() {
    if (!questionSetId) {
      setError("একটি প্রশ্নসেট নির্বাচন করুন");
      return;
    }
    await postSend({
      platforms,
      contentType: "QUESTION_SET",
      questionSetId,
      contentText: slideCaption.trim() || undefined,
    });
  }

  const providerModels = models.filter((m) => m.provider === provider);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Broadcast Center</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/admin/broadcast-center/integrations"
            className="text-[#145B3D] underline"
          >
            Integrations
          </Link>
          <Link
            href="/admin/broadcast-center/history"
            className="text-[#145B3D] underline"
          >
            History
          </Link>
          <Link
            href="/admin/broadcast-center/rules"
            className="text-[#145B3D] underline"
          >
            Automation
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === t.id ? "bg-[#145B3D] text-white" : "border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="space-y-2">
        <p className="text-sm font-medium">Platforms</p>
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
      </section>

      {tab === "text" && (
        <>
          <section className="space-y-2">
            <p className="text-sm font-medium">Content type</p>
            <div className="flex flex-wrap gap-2">
              {TEXT_TYPES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setContentType(c.id)}
                  className={`rounded-full px-3 py-1 text-sm border ${
                    contentType === c.id
                      ? "bg-[#145B3D] text-white border-[#145B3D]"
                      : ""
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2 border rounded-2xl p-4">
            <p className="text-sm font-medium">AI model</p>
            <div className="flex flex-wrap gap-2">
              {(
                ["mistral", "gemini", "anthropic", "openai", "omniroute"] as AiProvider[]
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProvider(p);
                    const first = models.find((m) => m.provider === p && m.available);
                    setModelId(first?.id);
                  }}
                  className={`rounded-lg px-2 py-1 text-xs border capitalize ${
                    provider === p ? "bg-muted font-medium" : ""
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {provider === "omniroute" && omnirouteSubmodels.length > 0 && (
              <select
                className="border rounded-lg px-3 py-2 w-full text-sm"
                value={modelId ?? ""}
                onChange={(e) => setModelId(e.target.value)}
              >
                {omnirouteSubmodels.map((sm) => (
                  <option key={sm} value={sm}>
                    {sm}
                  </option>
                ))}
              </select>
            )}
            {provider !== "omniroute" && providerModels.length > 0 && (
              <select
                className="border rounded-lg px-3 py-2 w-full text-sm"
                value={modelId ?? ""}
                onChange={(e) => setModelId(e.target.value)}
              >
                {providerModels.map((m) => (
                  <option key={m.id} value={m.id} disabled={!m.available}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
            <textarea
              className="border rounded-lg px-3 py-2 w-full text-sm min-h-[80px]"
              placeholder="AI-র জন্য অতিরিক্ত প্রসঙ্গ (optional)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              className="bg-muted border rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate draft with AI"}
            </button>
          </section>

          <section className="space-y-2">
            <p className="text-sm font-medium">Post text</p>
            <textarea
              className="border rounded-lg px-3 py-2 w-full min-h-[160px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="এখানে পোস্ট লিখুন..."
            />
          </section>

          <button
            type="button"
            disabled={sending}
            onClick={handleSendText}
            className="bg-[#145B3D] text-white rounded-lg px-5 py-2 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send text post"}
          </button>
        </>
      )}

      {tab === "pdf" && (
        <>
          <section className="space-y-2">
            <p className="text-sm font-medium">PDF নির্বাচন করুন</p>
            <select
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={pdfId}
              onChange={(e) => setPdfId(e.target.value)}
            >
              <option value="">— PDF বেছে নিন —</option>
              {pdfs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.docType})
                </option>
              ))}
            </select>
            <textarea
              className="border rounded-lg px-3 py-2 w-full text-sm min-h-[80px]"
              placeholder="Caption (optional)"
              value={pdfCaption}
              onChange={(e) => setPdfCaption(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Telegram-এ PDF ফাইল হিসেবে যাবে। Facebook-এ শিরোনাম/নোটিশ টেক্সট পোস্ট হবে।
            </p>
          </section>
          <button
            type="button"
            disabled={sending || !pdfId}
            onClick={handleSendPdf}
            className="bg-[#145B3D] text-white rounded-lg px-5 py-2 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send PDF to channels"}
          </button>
        </>
      )}

      {tab === "question-set" && (
        <>
          <section className="space-y-2">
            <p className="text-sm font-medium">প্রশ্নসেট নির্বাচন</p>
            <select
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={examSlug}
              onChange={(e) => {
                setExamSlug(e.target.value);
                setSubCategorySlug("");
                setQuestionSetId("");
              }}
            >
              <option value="">— পরীক্ষার ক্যাটাগরি —</option>
              {examCategories.map((e) => (
                <option key={e.id} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </select>
            <select
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={subCategorySlug}
              onChange={(e) => {
                setSubCategorySlug(e.target.value);
                setQuestionSetId("");
              }}
              disabled={!examSlug}
            >
              <option value="">— সাব-ক্যাটাগরি —</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={questionSetId}
              onChange={(e) => setQuestionSetId(e.target.value)}
              disabled={!subCategorySlug}
            >
              <option value="">— প্রশ্নসেট —</option>
              {questionSets.map((qs) => (
                <option key={qs.id} value={qs.id}>
                  {qs.title} — {qs.date}
                </option>
              ))}
            </select>
            <textarea
              className="border rounded-lg px-3 py-2 w-full text-sm min-h-[80px]"
              placeholder="Caption (optional)"
              value={slideCaption}
              onChange={(e) => setSlideCaption(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              প্রথম grouped slide auto-render হবে (cache থাকলে instant)। Telegram-এ PNG
              upload। Facebook-এ public image URL না থাকলে টেক্সট fallback।
            </p>
          </section>
          <button
            type="button"
            disabled={sending || !questionSetId}
            onClick={handleSendQuestionSet}
            className="bg-[#145B3D] text-white rounded-lg px-5 py-2 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send question set slide"}
          </button>
        </>
      )}

      {message && <p className="text-green-700 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
