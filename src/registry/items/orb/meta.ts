import type { Meta } from "../../types";

export default {
  name: "Orb",
  category: "backgrounds",
  description: "A glowing iridescent orb whose film of color slides around its rim; it wobbles and brightens when hovered. WebGL.",
  props: [
    { name: "hue", type: "number", min: 0, max: 360, step: 1, default: 0, description: "Hue rotation in degrees." },
    { name: "hoverIntensity", type: "number", min: 0, max: 2, step: 0.05, default: 1, description: "How much the orb warps and brightens on hover." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "size", type: "number", min: 0.3, max: 2, step: 0.05, default: 1, description: "Size relative to the container's shorter side." },
  ],
  usage: `<div className="relative h-96">
  <Orb hue={0} />
</div>`,
} satisfies Meta;
