import type { Meta } from "../../types";

export default {
  name: "Evil Eye",
  category: "backgrounds",
  description: "A giant smoldering eye with a churning iris and slit pupil that tracks the cursor and blinks now and then. WebGL.",
  props: [
    { name: "color", type: "color", default: "#ff4d1a", description: "Glow color of the iris and halo." },
    { name: "scale", type: "number", min: 0.4, max: 2, step: 0.05, default: 1, description: "Eye size multiplier." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Iris churn speed multiplier." },
    { name: "blink", type: "boolean", default: true, description: "Blink every few seconds." },
    { name: "follow", type: "boolean", default: true, description: "The pupil follows the cursor." },
  ],
  usage: `<div className="relative h-96">
  <EvilEye color="#ff4d1a" />
</div>`,
} satisfies Meta;
