import { decodeHtmlEntities } from "@/lib/syllabus-html";

import type { Scene, SceneNode } from "../types";

/** Decode HTML entities so mixed Bangla/English reads naturally in the UI. */
export function decodeSlideText(text: string): string {
  return decodeHtmlEntities(text);
}

/** Branding chrome (header bar, footer) — not editable by members. */
export function isSlideChromeNodeId(id: string): boolean {
  return (
    id.startsWith("header") ||
    id.startsWith("footer") ||
    id.startsWith("brand") ||
    id === "question-panel"
  );
}

export function isEditableSlideTextNode(node: SceneNode): boolean {
  if (node.type !== "text" || !node.text?.trim()) return false;
  if (isSlideChromeNodeId(node.id)) return false;
  return true;
}

export interface SlidePreviewLine {
  id: string;
  text: string;
  bold: boolean;
  color: string;
}

export interface SlideChromePreview {
  headerTitle: string;
  headerCount: string;
  footerText: string;
  headerHeight: number;
  footerHeight: number;
}

function findTextNode(scene: Scene, ids: string[]): string {
  for (const id of ids) {
    const node = scene.nodes.find((n) => n.id === id && n.type === "text");
    if (node?.text?.trim()) return decodeSlideText(node.text);
  }
  return "";
}

function findRectHeight(scene: Scene, ids: string[], fallback: number): number {
  for (const id of ids) {
    const node = scene.nodes.find((n) => n.id === id && n.type === "rect");
    if (node?.height) return node.height;
  }
  return fallback;
}

/** Extract header/footer labels from scene JSON for browser fallback preview. */
export function extractSlideChrome(scene: Scene): SlideChromePreview | null {
  const hasHeader = scene.nodes.some(
    (n) => n.id === "header-bg" || n.id === "brand-bar",
  );
  const hasFooter = scene.nodes.some((n) => n.id === "footer-bg");
  if (!hasHeader && !hasFooter) return null;

  return {
    headerTitle: findTextNode(scene, ["header-title", "brand-title"]) || "Farhan MCQ",
    headerCount: findTextNode(scene, ["header-slide-count", "brand-count"]),
    footerText:
      findTextNode(scene, ["footer-text"]) ||
      "সরকারি চাকরি প্রস্তুতি — Farhan MCQ",
    headerHeight: findRectHeight(scene, ["header-bg", "brand-bar"], 54),
    footerHeight: findRectHeight(scene, ["footer-bg"], 40),
  };
}

/** Text nodes sorted top-to-bottom for readable card preview (Bangla + English). */
export function extractSlidePreviewLines(scene: Scene): SlidePreviewLine[] {
  return scene.nodes
    .filter(isEditableSlideTextNode)
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((node) => ({
      id: node.id,
      text: decodeSlideText(node.text ?? ""),
      bold: node.fontStyle === "bold",
      color: node.fill ?? "#1a2332",
    }));
}

export function getSlidePreviewSnippet(scene: Scene, maxLength = 72): string {
  const first = extractSlidePreviewLines(scene)[0]?.text ?? "";
  if (first.length <= maxLength) return first;
  return `${first.slice(0, maxLength - 1)}…`;
}

/** Decode editable text when opening the edit dialog (keeps backend-safe values on save). */
export function decodeSceneTextForDisplay(scene: Scene): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) => {
      if (node.type !== "text" || !node.text) return node;
      return { ...node, text: decodeSlideText(node.text) };
    }),
  };
}

/** Normalize updatedAt to a numeric cache-bust key. */
export function slideImageVersionKey(updatedAt: string | number): number {
  if (typeof updatedAt === "number") return updatedAt;
  const ms = Date.parse(updatedAt);
  return Number.isNaN(ms) ? Date.now() : ms;
}
