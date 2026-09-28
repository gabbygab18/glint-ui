import type { Meta } from "../../types";

export default {
  name: "Morph Text",
  category: "text-animations",
  description: "Cycles through words that melt into one another through a gooey blur-and-threshold crossfade.",
  props: [
    { name: "words", type: "list", default: ["Imagine", "Design", "Prototype", "Build", "Ship"], description: "Words to cycle through." },
    { name: "duration", type: "number", min: 300, max: 3000, step: 50, default: 1100, description: "Morph duration, in ms." },
    { name: "pause", type: "number", min: 0, max: 5000, step: 100, default: 1600, description: "How long each word rests, in ms." },
  ],
  usage: `<MorphText words={["Imagine", "Design", "Build", "Ship"]} />`,
} satisfies Meta;
