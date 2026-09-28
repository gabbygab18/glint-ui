import type { Meta } from "../../types";

export default {
  name: "Stagger Chars",
  category: "text-animations",
  description: "Hover and a wave of bouncing, tilting characters ripples through the text with a flash of accent color.",
  props: [
    { name: "text", type: "string", default: "Hover me, gently", description: "Text to animate." },
    { name: "effect", type: "select", options: ["wave", "bounce", "spin", "flip"], default: "wave", description: "Motion each character performs." },
    { name: "direction", type: "select", options: ["start", "end", "center", "edges", "random"], default: "start", description: "Where the wave starts." },
    { name: "stagger", type: "number", min: 0, max: 150, step: 5, default: 35, description: "Delay between characters, in ms." },
    { name: "duration", type: "number", min: 200, max: 2000, step: 50, default: 700, description: "Duration of each character's motion, in ms." },
    { name: "accent", type: "color", default: "#a3e635", description: "Color flashed at the peak of the motion." },
  ],
  usage: `<StaggerChars text="Hover me, gently" effect="wave" direction="center" />`,
} satisfies Meta;
