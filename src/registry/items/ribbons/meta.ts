import type { Meta } from "../../types";

export default {
  name: "Ribbons",
  category: "animations",
  description: "Silky, twisting ribbons that chase the cursor on springs and fan out as they lag behind.",
  props: [
    { name: "colors", type: "list", default: ["#c6ff3d", "#22d3ee", "#a78bfa", "#f472b6"], description: "One ribbon per color, front to back." },
    { name: "thickness", type: "number", min: 4, max: 60, step: 1, default: 22, description: "Head width in px." },
    { name: "length", type: "number", min: 10, max: 120, step: 5, default: 40, description: "Points per ribbon; longer tails at higher values." },
    { name: "spring", type: "number", min: 0.01, max: 0.3, step: 0.01, default: 0.05, description: "Pull toward the cursor. Lower lags more." },
    { name: "twist", type: "boolean", default: true, description: "Width ripples like a twisting ribbon." },
    { name: "idle", type: "boolean", default: true, description: "Ribbons wander on their own while the cursor is away." },
  ],
  usage: `<div className="relative h-96">\n  <Ribbons colors={["#c6ff3d", "#22d3ee"]} />\n</div>`,
} satisfies Meta;
