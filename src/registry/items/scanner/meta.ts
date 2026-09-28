import type { Meta } from "../../types";

export default {
  name: "Scanner",
  category: "backgrounds",
  description: "A bright scan line sweeping back and forth over a faint dot grid, leaving a fading afterglow. WebGL.",
  props: [
    { name: "color", type: "color", default: "#22d3ee", description: "Scan line and texture color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Sweep speed multiplier." },
    { name: "direction", type: "select", options: ["vertical", "horizontal"], default: "vertical", description: "Sweep up/down or left/right." },
    { name: "cellSize", type: "number", min: 6, max: 60, step: 1, default: 18, description: "Dot grid spacing in px." },
    { name: "trail", type: "number", min: 0.1, max: 3, step: 0.1, default: 1, description: "Afterglow length." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Brightness." },
  ],
  usage: `<div className="relative h-96">
  <Scanner color="#22d3ee" direction="vertical" />
</div>`,
} satisfies Meta;
