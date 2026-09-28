import type { Meta } from "../../types";

export default {
  name: "Background Paths",
  category: "backgrounds",
  description: "Two layered ribbons of flowing SVG curves with light running along their strokes. Pure SVG + CSS.",
  props: [
    { name: "color", type: "color", default: "#a78bfa", description: "Color at the start of each curve." },
    { name: "accent", type: "color", default: "#22d3ee", description: "Color at the end of each curve." },
    { name: "count", type: "number", min: 4, max: 64, step: 1, default: 32, description: "Curves per layer." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "strokeWidth", type: "number", min: 0.3, max: 4, step: 0.1, default: 1, description: "Stroke width multiplier." },
  ],
  usage: `<div className="relative h-96">
  <BackgroundPaths color="#a78bfa" accent="#22d3ee" />
</div>`,
} satisfies Meta;
