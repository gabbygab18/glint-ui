import type { Meta } from "../../types";

export default {
  name: "Modern Loader",
  category: "micro-interactions",
  description: "A gradient comet arc orbits with a glowing head while the ring breathes between circle and squircle, around a counter-spinning inner arc and a morphing core.",
  isNew: true,
  props: [
    { name: "size", type: "number", min: 24, max: 240, step: 4, default: 96, description: "Px." },
    { name: "colors", type: "list", default: ["#22d3ee", "#a855f7", "#f43f5e"], description: "Arc gradient stops, tail to head." },
    { name: "thickness", type: "number", min: 2, max: 20, step: 1, default: 6, description: "Ring thickness in px." },
    { name: "speed", type: "number", min: 0.25, max: 3, step: 0.05, default: 1, description: "Speed multiplier." },
    { name: "label", type: "string", default: "Loading", description: "Screen reader text." },
  ],
  usage: `<ModernLoader size={64} colors={["#22d3ee", "#a855f7"]} />`,
} satisfies Meta;
