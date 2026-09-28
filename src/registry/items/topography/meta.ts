import type { Meta } from "../../types";

export default {
  name: "Topography",
  category: "backgrounds",
  description: "Animated topographic contour lines over slowly shifting terrain, with a hill that rises under the cursor. WebGL.",
  props: [
    { name: "color", type: "color", default: "#38bdf8", description: "Color of the low contour lines." },
    { name: "peakColor", type: "color", default: "#c6ff3d", description: "Color of the peaks." },
    { name: "levels", type: "number", min: 4, max: 60, step: 1, default: 22, description: "Contour density." },
    { name: "lineWidth", type: "number", min: 0.5, max: 4, step: 0.25, default: 1, description: "Line width in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Terrain zoom." },
    { name: "cursorHill", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Height of the hill under the cursor." },
  ],
  usage: `<div className="relative h-96">
  <Topography color="#38bdf8" peakColor="#c6ff3d" />
</div>`,
} satisfies Meta;
