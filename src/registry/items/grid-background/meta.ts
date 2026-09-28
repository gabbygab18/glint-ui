import type { Meta } from "../../types";

export default {
  name: "Grid Background",
  category: "backgrounds",
  description: "A fine grid where random cells softly light up and fade out, framed by a radial fade. Canvas 2D.",
  props: [
    { name: "cellSize", type: "number", min: 12, max: 96, step: 2, default: 36, description: "Px per cell." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Glow color of lit cells." },
    { name: "lineColor", type: "color", default: "#52525b", description: "Grid line color." },
    { name: "density", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.05, description: "Fraction of cells lit at any moment." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Fade speed multiplier." },
    { name: "fade", type: "number", min: 0.3, max: 1.5, step: 0.05, default: 0.75, description: "Size of the visible area before the radial fade." },
  ],
  usage: `<div className="relative h-96">
  <GridBackground color="#c6ff3d" />
</div>`,
} satisfies Meta;
