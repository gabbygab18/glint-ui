import type { Meta } from "../../types";

export default {
  name: "Threads",
  category: "backgrounds",
  description: "A bundle of thin glowing threads twisting like strings in the wind, bending toward the cursor.",
  props: [
    { name: "count", type: "number", min: 4, max: 80, step: 1, default: 32, description: "Number of threads." },
    { name: "color", type: "color", default: "#22d3ee", description: "Color of the first thread." },
    { name: "accentColor", type: "color", default: "#c084fc", description: "Color of the last thread." },
    { name: "amplitude", type: "number", min: 0, max: 2.5, step: 0.05, default: 1, description: "Wave height multiplier." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Wind speed multiplier." },
    { name: "attraction", type: "number", min: 0, max: 1.6, step: 0.05, default: 1, description: "Pull toward the cursor." },
    { name: "thickness", type: "number", min: 0.5, max: 3, step: 0.25, default: 1, description: "Stroke width in px." },
  ],
  usage: `<div className="relative h-96">
  <Threads count={32} color="#22d3ee" accentColor="#c084fc" />
</div>`,
} satisfies Meta;
