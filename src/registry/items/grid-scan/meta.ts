import type { Meta } from "../../types";

export default {
  name: "Grid Scan",
  category: "backgrounds",
  description: "A neon perspective grid floor swept by a glowing scan line, with a horizon that follows the cursor.",
  props: [
    { name: "gridColor", type: "color", default: "#8b5cf6", description: "Grid line color." },
    { name: "scanColor", type: "color", default: "#22d3ee", description: "Scanning light color." },
    { name: "density", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Grid cell density." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Scan sweep speed." },
    { name: "scanWidth", type: "number", min: 0.1, max: 2, step: 0.05, default: 0.5, description: "Thickness of the scan band." },
    { name: "glow", type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1, description: "Overall glow." },
  ],
  usage: `<div className="relative h-96 bg-black">
  <GridScan gridColor="#8b5cf6" scanColor="#22d3ee" />
</div>`,
} satisfies Meta;
