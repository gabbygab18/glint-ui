import type { Meta } from "../../types";

export default {
  name: "Layered Text",
  category: "text-animations",
  description: "Colored copies hide behind each letter and fan out in a springy cascade on hover, then stack back.",
  props: [
    { name: "text", type: "string", default: "STACKED", description: "Text to render." },
    { name: "colors", type: "list", default: ["#a3e635", "#22d3ee", "#818cf8", "#f472b6"], description: "One color per layer, nearest first." },
    { name: "offset", type: "number", min: 1, max: 20, step: 1, default: 6, description: "Distance between layers when fanned out, in px." },
    { name: "angle", type: "number", min: 0, max: 360, step: 5, default: 45, description: "Fan-out direction in degrees (0 = right, 90 = down)." },
    { name: "stagger", type: "number", min: 0, max: 150, step: 5, default: 30, description: "Delay between letters, in ms." },
    { name: "duration", type: "number", min: 100, max: 2000, step: 50, default: 700, description: "Transition duration, in ms." },
    { name: "active", type: "boolean", default: false, description: "Keep the layers fanned out." },
  ],
  usage: `<LayeredText text="STACKED" offset={6} angle={45} />`,
} satisfies Meta;
