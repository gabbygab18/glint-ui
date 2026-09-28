import type { Meta } from "../../types";

export default {
  name: "Waves",
  category: "backgrounds",
  description: "Stacked lines flowing like a noise-driven sea; the cursor drags through them and they spring back.",
  props: [
    { name: "color", type: "color", default: "#38bdf8", description: "Color of the top lines." },
    { name: "accentColor", type: "color", default: "#a78bfa", description: "Color of the bottom lines." },
    { name: "gap", type: "number", min: 6, max: 48, step: 1, default: 14, description: "Px between lines." },
    { name: "amplitude", type: "number", min: 0, max: 3, step: 0.05, default: 1, description: "Wave height multiplier." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "lineWidth", type: "number", min: 0.5, max: 3, step: 0.25, default: 1, description: "Stroke width in px." },
    { name: "cursorForce", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How far the cursor drags the lines." },
  ],
  usage: `<div className="relative h-96">
  <Waves color="#38bdf8" accentColor="#a78bfa" />
</div>`,
} satisfies Meta;
