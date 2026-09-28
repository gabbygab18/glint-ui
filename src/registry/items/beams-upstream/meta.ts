import type { Meta } from "../../types";

export default {
  name: "Beams Upstream",
  category: "backgrounds",
  description: "Thin light beams rise along the vertical lines of a softly masked grid, trailing a glowing tail. Canvas 2D.",
  props: [
    { name: "color", type: "color", default: "#38bdf8", description: "Beam color." },
    { name: "gridColor", type: "color", default: "#334155", description: "Grid line color." },
    { name: "gap", type: "number", min: 20, max: 140, step: 2, default: 56, description: "Grid cell size in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Rise speed multiplier." },
    { name: "density", type: "number", min: 0.5, max: 10, step: 0.5, default: 4, description: "Beams on screen per 10 grid columns." },
    { name: "length", type: "number", min: 0.05, max: 0.8, step: 0.01, default: 0.28, description: "Beam length as a fraction of the height." },
  ],
  usage: `<div className="relative h-96">
  <BeamsUpstream color="#38bdf8" />
</div>`,
} satisfies Meta;
