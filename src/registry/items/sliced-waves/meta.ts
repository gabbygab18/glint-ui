import type { Meta } from "../../types";

export default {
  name: "Sliced Waves",
  category: "backgrounds",
  description: "A flowing wave gradient cut into horizontal strips that glide sideways independently. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#0ea5e9", description: "First palette color." },
    { name: "colorB", type: "color", default: "#8b5cf6", description: "Second palette color." },
    { name: "colorC", type: "color", default: "#f43f5e", description: "Third palette color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "slices", type: "number", min: 2, max: 40, step: 1, default: 14, description: "Number of strips." },
    { name: "shift", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How far strips slide." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Wave zoom." },
  ],
  usage: `<div className="relative h-96">
  <SlicedWaves slices={14} />
</div>`,
} satisfies Meta;
