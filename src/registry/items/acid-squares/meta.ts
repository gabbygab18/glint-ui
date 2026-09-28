import type { Meta } from "../../types";

export default {
  name: "Acid Squares",
  category: "backgrounds",
  description: "A grid of rounded squares cycling through acid neon colors in interfering waves; the cursor lights them up. WebGL.",
  props: [
    {
      name: "colors",
      type: "list",
      default: ["#c6ff3d", "#00e5ff", "#ff2bd6", "#ffb800"],
      description: "Up to four colors the squares cycle through.",
    },
    { name: "cellSize", type: "number", min: 10, max: 80, step: 1, default: 28, description: "Square size in px, gap included." },
    { name: "gap", type: "number", min: 0, max: 16, step: 1, default: 4, description: "Gap between squares in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Wave speed multiplier." },
    { name: "cursorRadius", type: "number", min: 40, max: 500, step: 10, default: 180, description: "Px radius the cursor lights up." },
  ],
  usage: `<div className="relative h-96">
  <AcidSquares cellSize={28} />
</div>`,
} satisfies Meta;
