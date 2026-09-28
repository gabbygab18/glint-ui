import type { Meta } from "../../types";

export default {
  name: "Gradient Waves",
  category: "backgrounds",
  description: "Stacked gradient waves rolling at different speeds, each casting a soft shadow on the layer behind.",
  props: [
    { name: "colors", type: "list", default: ["#312e81", "#5b21b6", "#a21caf", "#db2777", "#f97316"], description: "One color per wave, back to front (up to six)." },
    { name: "amplitude", type: "number", min: 0, max: 2.5, step: 0.05, default: 1, description: "Wave height." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed." },
    { name: "shadow", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Depth shadow between layers." },
    { name: "height", type: "number", min: 0.2, max: 1, step: 0.01, default: 0.72, description: "Position of the back wave (0 bottom, 1 top)." },
  ],
  usage: `<div className="relative h-96">
  <GradientWaves />
</div>`,
} satisfies Meta;
