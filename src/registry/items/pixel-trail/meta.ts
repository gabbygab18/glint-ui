import type { Meta } from "../../types";

export default {
  name: "Pixel Trail",
  category: "animations",
  description: "Grid pixels ignite along the cursor path, burn white-hot and shrink away as they fade.",
  props: [
    { name: "pixelSize", type: "number", min: 8, max: 64, step: 2, default: 24, description: "Cell size in px." },
    { name: "decay", type: "number", min: 150, max: 3000, step: 50, default: 700, description: "Ms for a lit pixel to fade out." },
    { name: "brush", type: "number", min: 0, max: 4, step: 1, default: 1, description: "Brush radius in cells." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Trail color." },
    { name: "showGrid", type: "boolean", default: true, description: "Faint grid lines under the trail." },
    { name: "idle", type: "boolean", default: true, description: "Draw a wandering trail while the cursor is away." },
  ],
  usage: `<div className="relative h-96">\n  <PixelTrail pixelSize={24} decay={700} />\n</div>`,
} satisfies Meta;
