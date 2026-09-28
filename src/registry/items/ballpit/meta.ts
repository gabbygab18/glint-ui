import type { Meta } from "../../types";

export default {
  name: "Ballpit",
  category: "backgrounds",
  description: "Glossy colored balls tumble in with gravity, collide and pile up; sweep the cursor through to shove them around. Canvas 2D.",
  props: [
    { name: "count", type: "number", min: 5, max: 200, step: 1, default: 60, description: "Number of balls." },
    {
      name: "colors",
      type: "list",
      default: ["#c6ff3d", "#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"],
      description: "Ball colors.",
    },
    { name: "size", type: "number", min: 0.3, max: 1.6, step: 0.05, default: 1, description: "Ball size multiplier." },
    { name: "gravity", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Gravity multiplier; 0 floats." },
    { name: "bounce", type: "number", min: 0, max: 1, step: 0.05, default: 0.7, description: "Bounciness." },
    { name: "interactive", type: "boolean", default: true, description: "The cursor shoves the balls." },
    { name: "cursorRadius", type: "number", min: 20, max: 250, step: 5, default: 90, description: "Px radius of the cursor's push." },
  ],
  usage: `<div className="relative h-96">
  <Ballpit count={60} />
</div>`,
} satisfies Meta;
