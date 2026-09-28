import type { Meta } from "../../types";

export default {
  name: "Soft Aurora",
  category: "backgrounds",
  description: "Gentle pastel aurora curtains that sway in slow vertical folds, with soft light rays. WebGL.",
  props: [
    { name: "colors", type: "list", default: ["#6ee7b7", "#a78bfa", "#f9a8d4"], description: "Three curtain colors, back to front." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Width of the folds." },
    { name: "intensity", type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1, description: "Overall brightness." },
  ],
  usage: `<div className="relative h-96">
  <SoftAurora colors={["#6ee7b7", "#a78bfa", "#f9a8d4"]} />
</div>`,
} satisfies Meta;
