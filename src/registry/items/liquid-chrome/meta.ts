import type { Meta } from "../../types";

export default {
  name: "Liquid Chrome",
  category: "backgrounds",
  description: "A slowly folding mirror-like chrome surface that ripples wherever the cursor moves or clicks. WebGL.",
  props: [
    { name: "color", type: "color", default: "#d4dcec", description: "Metal tint." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "scale", type: "number", min: 0.5, max: 8, step: 0.1, default: 3, description: "Wave frequency." },
    { name: "amplitude", type: "number", min: 0, max: 2, step: 0.05, default: 0.6, description: "Height of the flowing folds." },
    { name: "interactive", type: "boolean", default: true, description: "Cursor and click ripples." },
  ],
  usage: `<div className="relative h-96">
  <LiquidChrome color="#d4dcec" />
</div>`,
} satisfies Meta;
