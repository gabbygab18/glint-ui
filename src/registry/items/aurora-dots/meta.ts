import type { Meta } from "../../types";

export default {
  name: "Aurora Dots",
  category: "backgrounds",
  description: "A dot matrix lit by drifting aurora ribbons; each dot takes its color from the moving light field and glows near the cursor. WebGL.",
  props: [
    { name: "colors", type: "list", default: ["#34d399", "#22d3ee", "#a78bfa"], description: "Three aurora colors." },
    { name: "baseColor", type: "color", default: "#3f3f46", description: "Color of unlit dots." },
    { name: "gap", type: "number", min: 8, max: 48, step: 1, default: 18, description: "Px between dots." },
    { name: "dotSize", type: "number", min: 0.5, max: 8, step: 0.25, default: 2.5, description: "Dot radius in px at full light." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Size of the aurora bands." },
  ],
  usage: `<div className="relative h-96">
  <AuroraDots colors={["#34d399", "#22d3ee", "#a78bfa"]} />
</div>`,
} satisfies Meta;
