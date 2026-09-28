import type { Meta } from "../../types";

export default {
  name: "Metallic Paint",
  category: "animations",
  description: "Liquid chrome flows inside a beveled star, heart, ring or glyph, with reflections that lean toward the cursor. Raw WebGL.",
  props: [
    { name: "shape", type: "select", options: ["star", "heart", "ring", "text"], default: "star", description: "Mask shape." },
    { name: "text", type: "string", default: "G", description: "Glyphs used when shape is text." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "tint", type: "color", default: "#eef2ff", description: "Highlight tint." },
    { name: "bands", type: "number", min: 0.3, max: 5, step: 0.1, default: 1.6, description: "Density of reflected bands." },
    { name: "bevel", type: "number", min: 0, max: 20, step: 0.5, default: 7, description: "Bevel depth near the edges." },
  ],
  usage: `<MetallicPaint shape="text" text="G" className="size-80" />`,
} satisfies Meta;
