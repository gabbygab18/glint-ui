import type { Meta } from "../../types";

export default {
  name: "Cursor Grid",
  category: "animations",
  description: "A grid of cells that light up under the cursor and cool into a fading color trail.",
  props: [
    { name: "cellSize", type: "number", min: 8, max: 96, step: 2, default: 36, description: "Cell size in px." },
    { name: "gap", type: "number", min: 0, max: 16, step: 1, default: 4, description: "Gap between cells in px." },
    { name: "radius", type: "number", min: 0, max: 24, step: 1, default: 6, description: "Corner radius in px." },
    { name: "baseColor", type: "color", default: "#27272a", description: "Idle cell outline color." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Color of freshly lit cells." },
    { name: "trailColor", type: "color", default: "#22d3ee", description: "Color lit cells cool down to as they fade." },
    { name: "fade", type: "number", min: 100, max: 4000, step: 100, default: 1400, description: "Ms for a lit cell to fade out." },
    { name: "brush", type: "number", min: 0, max: 4, step: 0.1, default: 1.5, description: "Brush radius in cells." },
  ],
  usage: `<div className="relative h-96">
  <CursorGrid cellSize={36} />
</div>`,
} satisfies Meta;
