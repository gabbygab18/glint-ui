import type { Meta } from "../../types";

export default {
  name: "Meta Balls",
  category: "animations",
  description: "Glossy liquid blobs that drift, merge and split, with one that follows your cursor. Raw WebGL.",
  props: [
    { name: "count", type: "number", min: 1, max: 15, step: 1, default: 7, description: "Wandering balls (plus the cursor ball)." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Color at the top." },
    { name: "color2", type: "color", default: "#0ea5e9", description: "Color at the bottom." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Motion speed multiplier." },
    { name: "size", type: "number", min: 0.3, max: 2.5, step: 0.05, default: 1, description: "Ball size multiplier." },
    { name: "followCursor", type: "boolean", default: true, description: "One ball tracks the cursor." },
  ],
  usage: `<div className="relative h-96">
  <MetaBalls count={7} />
</div>`,
} satisfies Meta;
