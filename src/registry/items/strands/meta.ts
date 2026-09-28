import type { Meta } from "../../types";

export default {
  name: "Strands",
  category: "animations",
  description: "A curtain of hanging verlet ropes that sway in a soft breeze and part around the cursor.",
  props: [
    { name: "count", type: "number", min: 8, max: 160, step: 4, default: 56, description: "Number of hanging strands." },
    { name: "length", type: "number", min: 0.2, max: 1, step: 0.02, default: 0.72, description: "Strand length as a fraction of the container height." },
    { name: "segments", type: "number", min: 6, max: 40, step: 1, default: 20, description: "Rope segments per strand. More is smoother." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Strand color." },
    { name: "tipColor", type: "color", default: "#22d3ee", description: "Color at the tips." },
    { name: "thickness", type: "number", min: 0.5, max: 5, step: 0.25, default: 1.5, description: "Line width in px." },
    { name: "sway", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Strength of the idle breeze." },
    { name: "radius", type: "number", min: 20, max: 250, step: 5, default: 90, description: "Px around the cursor that pushes strands aside." },
  ],
  usage: `<div className="relative h-96">\n  <Strands count={56} />\n</div>`,
} satisfies Meta;
