import type { Meta } from "../../types";

export default {
  name: "Bolt Strike",
  category: "backgrounds",
  description: "A night storm where procedural, forking lightning bolts strike at random spots and light up the clouds. Canvas 2D.",
  props: [
    { name: "color", type: "color", default: "#a5b4fc", description: "Glow color of the bolts and flash." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Storm tempo; higher strikes more often." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Bolt thickness multiplier." },
    { name: "flash", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Strength of the sky flash." },
    { name: "branching", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "How much the bolts fork." },
  ],
  usage: `<div className="relative h-96">
  <BoltStrike color="#a5b4fc" />
</div>`,
} satisfies Meta;
