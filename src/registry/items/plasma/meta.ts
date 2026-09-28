import type { Meta } from "../../types";

export default {
  name: "Plasma",
  category: "backgrounds",
  description: "Smooth, glossy plasma flowing through a three-color palette; the cursor twists it into a whirlpool. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#6d28d9", description: "First palette color." },
    { name: "colorB", type: "color", default: "#ec4899", description: "Second palette color." },
    { name: "colorC", type: "color", default: "#06b6d4", description: "Third palette color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Pattern zoom." },
    { name: "mouseStrength", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Cursor twist strength." },
  ],
  usage: `<div className="relative h-96">
  <Plasma colorA="#6d28d9" colorB="#ec4899" colorC="#06b6d4" />
</div>`,
} satisfies Meta;
