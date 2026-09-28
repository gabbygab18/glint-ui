import type { Meta } from "../../types";

export default {
  name: "Silk",
  category: "backgrounds",
  description: "Flowing silk fabric with soft folds, a satin sheen and fine film grain. WebGL.",
  props: [
    { name: "color", type: "color", default: "#7c68ee", description: "Fabric color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Fold zoom." },
    { name: "noise", type: "number", min: 0, max: 1, step: 0.05, default: 0.4, description: "Film grain amount." },
    { name: "rotation", type: "number", min: 0, max: 360, step: 1, default: 0, description: "Fold direction in degrees." },
  ],
  usage: `<div className="relative h-96">
  <Silk color="#7c68ee" />
</div>`,
} satisfies Meta;
