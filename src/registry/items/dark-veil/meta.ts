import type { Meta } from "../../types";

export default {
  name: "Dark Veil",
  category: "backgrounds",
  description: "A dark, moody veil of slowly folding noise with a soft color tint and film grain. WebGL.",
  props: [
    { name: "color", type: "color", default: "#7c5cff", description: "Tint of the veil folds." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Size of the folds." },
    { name: "intensity", type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1, description: "Brightness of the folds." },
    { name: "grain", type: "number", min: 0, max: 0.2, step: 0.01, default: 0.05, description: "Film grain amount." },
  ],
  usage: `<div className="relative h-96">
  <DarkVeil color="#7c5cff" />
</div>`,
} satisfies Meta;
