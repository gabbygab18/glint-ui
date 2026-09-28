import type { Meta } from "../../types";

export default {
  name: "Beams",
  category: "backgrounds",
  description: "Soft volumetric light beams slanting across a dark scene, drifting and breathing through noisy haze. WebGL.",
  props: [
    { name: "color", type: "color", default: "#9fb4ff", description: "Light color of the beams." },
    { name: "count", type: "number", min: 1, max: 16, step: 1, default: 9, description: "Number of beams." },
    { name: "angle", type: "number", min: -60, max: 60, step: 1, default: 28, description: "Slant in degrees." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "intensity", type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1, description: "Overall brightness." },
    { name: "haze", type: "number", min: 0, max: 1, step: 0.05, default: 0.7, description: "How much drifting haze breaks up the beams." },
  ],
  usage: `<div className="relative h-96">
  <Beams color="#9fb4ff" count={9} />
</div>`,
} satisfies Meta;
