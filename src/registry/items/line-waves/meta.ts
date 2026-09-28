import type { Meta } from "../../types";

export default {
  name: "Line Waves",
  category: "backgrounds",
  description: "Dozens of fine horizontal lines weaving into flowing silk-like waves that bulge away from the cursor. Canvas 2D.",
  props: [
    { name: "count", type: "number", min: 4, max: 120, step: 1, default: 36, description: "Number of lines." },
    { name: "colorA", type: "color", default: "#22d3ee", description: "Top line color." },
    { name: "colorB", type: "color", default: "#a78bfa", description: "Bottom line color." },
    { name: "amplitude", type: "number", min: 0, max: 200, step: 2, default: 48, description: "Wave height in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "lineWidth", type: "number", min: 0.5, max: 4, step: 0.25, default: 1, description: "Stroke width in px." },
    { name: "interactive", type: "boolean", default: true, description: "Lines bulge away from the cursor." },
    { name: "bulgeRadius", type: "number", min: 40, max: 400, step: 10, default: 140, description: "Bulge radius in px." },
  ],
  usage: `<div className="relative h-96">
  <LineWaves count={36} />
</div>`,
} satisfies Meta;
