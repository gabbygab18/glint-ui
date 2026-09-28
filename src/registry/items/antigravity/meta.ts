import type { Meta } from "../../types";

export default {
  name: "Antigravity",
  category: "animations",
  description: "Weightless glowing dust that drifts upward and curls away from the cursor.",
  props: [
    { name: "count", type: "number", min: 50, max: 1500, step: 10, default: 600, description: "Number of particles." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Particle glow color (6-digit hex)." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Upward drift multiplier." },
    { name: "radius", type: "number", min: 40, max: 400, step: 10, default: 160, description: "Px radius the cursor disturbs." },
    { name: "swirl", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "How hard the cursor swirls particles away." },
    { name: "size", type: "number", min: 0.5, max: 6, step: 0.1, default: 3, description: "Largest particle radius in px." },
  ],
  usage: `<div className="relative h-96">
  <Antigravity count={400} />
</div>`,
} satisfies Meta;
