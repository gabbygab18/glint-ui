import type { Meta } from "../../types";

export default {
  name: "Magic Rings",
  category: "animations",
  description: "Concentric glowing rings spin at their own pace, breathe, and bend toward the cursor.",
  props: [
    { name: "rings", type: "number", min: 1, max: 16, step: 1, default: 7, description: "Number of rings." },
    { name: "colorFrom", type: "color", default: "#22d3ee", description: "Innermost ring color." },
    { name: "colorTo", type: "color", default: "#a855f7", description: "Outermost ring color." },
    { name: "speed", type: "number", min: 0, max: 5, step: 0.1, default: 1, description: "Rotation speed multiplier." },
    { name: "pull", type: "number", min: 0, max: 120, step: 2, default: 34, description: "Px the rings bend toward the cursor." },
    { name: "lineWidth", type: "number", min: 0.5, max: 6, step: 0.5, default: 2, description: "Stroke width in px." },
  ],
  usage: `<div className="relative h-96">
  <MagicRings rings={7} />
</div>`,
} satisfies Meta;
