import type { Scene } from "./types";

export const SLIDE_FONT_FAMILY = "NotoSansBengali";

export function normalizeSceneFonts(scene: Scene): Scene {
  return {
    ...scene,
    nodes: scene.nodes.map((node) => {
      if (node.type !== "text") return node;
      return { ...node, fontFamily: SLIDE_FONT_FAMILY };
    }),
  };
}
