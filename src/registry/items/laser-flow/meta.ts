import type { Meta } from "../../types";

export default {
  name: "Laser Flow",
  category: "animations",
  description: "A glowing laser beam pours down into a misty splash, with volumetric haze, flicker and drifting motes. Raw WebGL.",
  props: [
    { name: "color", type: "color", default: "#b388ff", description: "Beam color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Overall brightness." },
    { name: "width", type: "number", min: 0.3, max: 4, step: 0.1, default: 1, description: "Beam core width multiplier." },
    { name: "impact", type: "number", min: 0, max: 0.9, step: 0.01, default: 0.28, description: "Where the beam lands (0 = bottom)." },
    { name: "flicker", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Flicker amount." },
  ],
  usage: `<div className="relative h-96 bg-black">
  <LaserFlow color="#b388ff" />
</div>`,
} satisfies Meta;
