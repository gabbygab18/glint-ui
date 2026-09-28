import type { Meta } from "../../types";

export default {
  name: "Pixel Background",
  category: "backgrounds",
  description: "A coarse pixel mosaic whose tiles drift through a palette in slow waves and light up around the cursor. Canvas 2D.",
  props: [
    { name: "pixelSize", type: "number", min: 8, max: 80, step: 1, default: 26, description: "Px per tile." },
    { name: "gap", type: "number", min: 0, max: 10, step: 1, default: 2, description: "Px between tiles." },
    {
      name: "colors",
      type: "list",
      default: ["#0b1026", "#1e3a8a", "#7c3aed", "#f472b6"],
      description: "Palette the waves sweep through, dark to bright.",
    },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Wave speed multiplier." },
    { name: "brightness", type: "number", min: 0.1, max: 1.2, step: 0.05, default: 0.7, description: "Overall tile brightness." },
    { name: "interactive", type: "boolean", default: true, description: "Tiles brighten near the cursor." },
    { name: "radius", type: "number", min: 40, max: 400, step: 10, default: 160, description: "Cursor glow radius in px." },
  ],
  usage: `<div className="relative h-96">
  <PixelBackground colors={["#0b1026", "#1e3a8a", "#7c3aed", "#f472b6"]} />
</div>`,
} satisfies Meta;
