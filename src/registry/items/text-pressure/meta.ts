import type { Meta } from "../../types";

export default {
  name: "Text Pressure",
  category: "text-animations",
  description: "A full-width headline whose letters swell in weight and stretch taller as the cursor presses close.",
  props: [
    { name: "text", type: "string", default: "Pressure", description: "Headline text." },
    { name: "minWeight", type: "number", min: 100, max: 900, step: 50, default: 300, description: "Weight at rest." },
    { name: "maxWeight", type: "number", min: 100, max: 1000, step: 50, default: 900, description: "Weight under the cursor." },
    { name: "radius", type: "number", min: 50, max: 800, step: 10, default: 280, description: "Px around the cursor that applies pressure." },
    { name: "stretch", type: "number", min: 0, max: 1.5, step: 0.05, default: 0.35, description: "Extra vertical stretch at full pressure." },
    { name: "alpha", type: "boolean", default: false, description: "Fade letters that feel no pressure." },
    { name: "smoothing", type: "number", min: 0.02, max: 1, step: 0.02, default: 0.16, description: "How quickly letters follow the cursor." },
  ],
  usage: `<TextPressure text="Pressure" className="font-display text-9xl" />`,
} satisfies Meta;
