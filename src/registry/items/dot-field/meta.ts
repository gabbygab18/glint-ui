import type { Meta } from "../../types";

export default {
  name: "Dot Field",
  category: "backgrounds",
  description: "A perspective field of glowing dots rolling toward you in terrain-like waves; the camera leans with the cursor. WebGL.",
  props: [
    { name: "lowColor", type: "color", default: "#5b4bff", description: "Dot color in the valleys." },
    { name: "highColor", type: "color", default: "#5eead4", description: "Dot color on the crests." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Travel and wave speed multiplier." },
    { name: "amplitude", type: "number", min: 0, max: 2.5, step: 0.05, default: 1, description: "Wave height." },
    { name: "dotSize", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Dot size multiplier." },
    { name: "density", type: "number", min: 0.5, max: 2, step: 0.1, default: 1, description: "Grid density multiplier." },
  ],
  usage: `<div className="relative h-96">
  <DotField amplitude={1} />
</div>`,
} satisfies Meta;
