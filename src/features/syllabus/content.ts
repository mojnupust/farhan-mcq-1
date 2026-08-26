import {
  decodeHtmlEntities,
  looksLikeHtmlContent,
} from "@/lib/syllabus-html";
import { escapeHtml, sanitizeHtml } from "@/lib/sanitize";
import type { Syllabus } from "./types";

function extractBodyHtml(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch?.[1] ?? html;
}

function mdxToHtml(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (!t || t.startsWith("<")) return line;
      return `<p>${t}</p>`;
    })
    .join("\n");
  return html;
}

export function syllabusContentToHtml(syllabus: Syllabus): string {
  const raw = syllabus.content ?? "";
  // Admin often stores plain text / markdown with contentType "html".
  // Only run the HTML sanitizer when the payload actually looks like markup.
  if (looksLikeHtmlContent(raw)) {
    const decoded = decodeHtmlEntities(raw);
    return sanitizeHtml(extractBodyHtml(decoded));
  }

  return sanitizeHtml(mdxToHtml(raw));
}

export function syllabusPlainText(content: string, contentType: string): string {
  const source =
    contentType === "html" || looksLikeHtmlContent(content)
      ? decodeHtmlEntities(content)
          .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
          .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
          .replace(/<li[^>]*>/gi, "\n- ")
          .replace(/<[^>]+>/g, " ")
      : content;

  return source
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
