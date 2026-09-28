import type { Meta } from "../../types";

export default {
  name: "Striped Grid",
  category: "backgrounds",
  description: "A slowly scrolling grid of diagonally hatched cells that light up and fade as the cursor passes. Canvas 2D.",
  props: [
    { name: "cellSize", type: "number", min: 20, max: 140, step: 2, default: 56, description: "Px per cell, including the gap." },
    { name: "gap", type: "number", min: 0, max: 24, step: 1, default: 8, description: "Px between cells." },
    { name: "stripeSpacing", type: "number", min: 3, max: 24, step: 1, default: 7, description: "Px between stripes inside a cell." },
    { name: "stripeColor", type: "color", default: "#52525b", description: "Stripe and outline color of resting cells." },
    { name: "highlightColor", type: "color", default: "#c6ff3d", description: "Color of cells under the cursor." },
    { name: "speed", type: "number", min: 0, max: 80, step: 1, default: 12, description: "Scroll speed in px per second." },
  ],
  usage: `<div className="relative h-96">
  <StripedGrid highlightColor="#c6ff3d" />
</div>`,
} satisfies Meta;
