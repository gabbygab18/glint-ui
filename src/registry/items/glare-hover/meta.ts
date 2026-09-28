import type { Meta } from "../../types";

export default {
  name: "Glare Hover",
  category: "animations",
  description: "A glossy band of light sweeps across the card on hover or focus, like light catching foil.",
  props: [
    { name: "children", type: "node", description: "Card or element to shine." },
    { name: "angle", type: "number", min: -180, max: 180, step: 5, default: -45, description: "Angle of the glare band in degrees." },
    { name: "color", type: "color", default: "#ffffff", description: "Glare color." },
    { name: "opacity", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Peak opacity of the glare." },
    { name: "size", type: "number", min: 2, max: 60, step: 1, default: 20, description: "Band width, % of the sweep." },
    { name: "duration", type: "number", min: 150, max: 3000, step: 50, default: 800, description: "Ms for one sweep." },
    { name: "playOnce", type: "boolean", default: false, description: "Sweep only on enter; skip the return sweep on leave." },
  ],
  usage: `<GlareHover className="rounded-2xl">
  <Card />
</GlareHover>`,
} satisfies Meta;
