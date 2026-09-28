import type { Meta } from "../../types";

export default {
  name: "Ripple Grid",
  category: "backgrounds",
  description: "Glowing grid lines bent by ripples spreading from the center and from the cursor. WebGL.",
  props: [
    { name: "color", type: "color", default: "#8b5cf6", description: "Grid line color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "cellSize", type: "number", min: 16, max: 100, step: 2, default: 40, description: "Grid cell size in px." },
    { name: "amplitude", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How far ripples bend the lines." },
    { name: "frequency", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Ripple ring density." },
    { name: "glow", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Halo around the lines." },
    { name: "mouseStrength", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Cursor ripple strength." },
  ],
  usage: `<div className="relative h-96">
  <RippleGrid color="#8b5cf6" cellSize={40} />
</div>`,
} satisfies Meta;
