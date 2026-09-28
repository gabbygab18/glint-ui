import type { Meta } from "../../types";

export default {
  name: "Grid Motion",
  category: "backgrounds",
  description: "Tilted rows of tiles that slide in alternating directions as the cursor moves across.",
  props: [
    { name: "items", type: "list", default: [], description: "Image URLs or short labels; repeats to fill the grid. Empty shows numbered tiles." },
    { name: "rows", type: "number", min: 2, max: 8, step: 1, default: 4, description: "Number of rows." },
    { name: "columns", type: "number", min: 3, max: 12, step: 1, default: 7, description: "Tiles per row." },
    { name: "tilt", type: "number", min: -45, max: 45, step: 1, default: -12, description: "Grid rotation in degrees." },
    { name: "strength", type: "number", min: 0, max: 600, step: 10, default: 260, description: "Max slide in px." },
    { name: "gap", type: "number", min: 0, max: 48, step: 1, default: 16, description: "Gap between tiles in px." },
  ],
  usage: `<div className="relative h-96">
  <GridMotion items={["/a.jpg", "/b.jpg", "Hello"]} />
</div>`,
} satisfies Meta;
