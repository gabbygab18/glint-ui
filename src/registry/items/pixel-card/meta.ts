import type { Meta } from "../../types";

export default {
  name: "Pixel Card",
  category: "components",
  description: "A card whose background ripples into a field of twinkling canvas pixels on hover or focus, with built-in color themes.",
  props: [
    { name: "children", type: "node", description: "Card content." },
    { name: "variant", type: "select", options: ["lime", "ocean", "ember", "candy", "mono"], default: "lime", description: "Built-in color theme." },
    { name: "colors", type: "list", description: "Custom hex palette. Overrides variant." },
    { name: "gap", type: "number", min: 4, max: 16, step: 1, default: 6, description: "Distance between pixels in px." },
    { name: "pixelSize", type: "number", min: 1, max: 6, step: 0.5, default: 2.5, description: "Largest pixel size in px." },
    { name: "speed", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Reveal and twinkle speed multiplier." },
  ],
  usage: `<PixelCard variant="ocean">
  <h3>Hover me</h3>
</PixelCard>`,
} satisfies Meta;
