import type { Meta } from "../../types";

export default {
  name: "Liquid Ether",
  category: "backgrounds",
  description: "Luminous, colorful ether that flows on its own and swirls into eddies wherever the cursor moves. WebGL.",
  props: [
    { name: "colors", type: "list", default: ["#7c3aed", "#22d3ee", "#f472b6"], description: "Three colors blended through the flow." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "scale", type: "number", min: 0.5, max: 6, step: 0.1, default: 2.2, description: "Noise scale; higher gives finer wisps." },
    { name: "swirl", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How hard the cursor stirs the ether." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1.2, description: "Brightness." },
    { name: "autoStir", type: "boolean", default: true, description: "Keep stirring on its own while the cursor is away." },
  ],
  usage: `<div className="relative h-96">
  <LiquidEther colors={["#7c3aed", "#22d3ee", "#f472b6"]} />
</div>`,
} satisfies Meta;
