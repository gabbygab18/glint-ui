import type { Meta } from "../../types";

export default {
  name: "Electric Text",
  category: "text-animations",
  description: "Text wrapped in a crackling electric outline, driven by animated SVG turbulence displacement.",
  props: [
    { name: "text", type: "string", default: "HIGH VOLTAGE", description: "Text to electrify." },
    { name: "color", type: "color", default: "#7dd3fc", description: "Arc color." },
    { name: "intensity", type: "number", min: 0, max: 20, step: 0.5, default: 6, description: "Displacement strength, in px." },
    { name: "speed", type: "number", min: 4, max: 60, step: 1, default: 24, description: "Crackle updates per second." },
    { name: "glow", type: "boolean", default: true, description: "Soft outer glow." },
  ],
  usage: `<ElectricText text="HIGH VOLTAGE" color="#7dd3fc" />`,
} satisfies Meta;
