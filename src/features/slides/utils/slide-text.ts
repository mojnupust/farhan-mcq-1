import { decodeHtmlEntities } from "@/lib/syllabus-html";

import type { Scene, SceneNode } from "../types";

/** Decode HTML entities so mixed Bangla/English reads naturally in the UI. */
export function decodeSlideText(text: string): string {
  return decodeHtmlEntities(text);
}

export function isEditableSlideTextNode(node: SceneNode): boolean {
  if (node.type !== "text" || !node.text?.trim()) return false;
  if (node.id.startsWith("header") || node.id.startsWith("footer")) return false;
  return true;
}

export interface SlidePreviewLine {
  id: string;
  text: string;
  bold: boolean;
  color: string;
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
