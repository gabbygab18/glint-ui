import type { Meta } from "../../types";

export default {
  name: "Blur Text",
  category: "text-animations",
  description: "Words or letters drift in from above or below, sharpening out of a heavy blur as they scroll into view.",
  props: [
    { name: "text", type: "string", default: "Isn't this so cool?!", description: "Text to animate." },
    { name: "animateBy", type: "select", options: ["words", "letters"], default: "words", description: "Animate each word or each letter." },
    { name: "direction", type: "select", options: ["top", "bottom"], default: "top", description: "Where pieces come from." },
    { name: "delay", type: "number", min: 0, max: 300, step: 5, default: 90, description: "Delay between pieces, in ms." },
    { name: "duration", type: "number", min: 200, max: 2500, step: 50, default: 900, description: "Duration of each piece, in ms." },
    { name: "once", type: "boolean", default: true, description: "Animate only the first time; off replays on every re-entry." },
    { name: "as", type: "select", options: ["p", "h1", "h2", "h3", "span", "div"], default: "p", description: "Element to render.", control: false },
  ],
  usage: `<BlurText text="Isn't this so cool?!" animateBy="words" direction="top" />`,
} satisfies Meta;
