import type { Meta } from "../../types";

export default {
  name: "Shape Waves",
  category: "backgrounds",
  description: "Rows of small circles, squares and triangles bobbing and turning in rolling waves; they swell near the cursor. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#f472b6", description: "Color on the left." },
    { name: "colorB", type: "color", default: "#60a5fa", description: "Color on the right." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "shape", type: "select", options: ["mixed", "circle", "square", "triangle"], default: "mixed", description: "Shape to draw; mixed alternates by row." },
    { name: "cellSize", type: "number", min: 14, max: 80, step: 1, default: 32, description: "Grid spacing in px." },
    { name: "amplitude", type: "number", min: 0, max: 2, step: 0.05, default: 1, description: "How far shapes bob." },
    { name: "mouseStrength", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How much shapes swell near the cursor." },
  ],
  usage: `<div className="relative h-96">
  <ShapeWaves shape="mixed" cellSize={32} />
</div>`,
} satisfies Meta;
