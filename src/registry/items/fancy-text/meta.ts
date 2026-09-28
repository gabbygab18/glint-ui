import type { Meta } from "../../types";

export default {
  name: "Fancy Text",
  category: "text-animations",
  description: "Outlined letters that lift and fill with a sweeping gradient, one after another, on hover.",
  props: [
    { name: "text", type: "string", default: "Hover to fill", description: "Text to render." },
    { name: "colors", type: "list", default: ["#a3e635", "#22d3ee", "#a78bfa"], description: "Gradient stops for the filled state." },
    { name: "strokeWidth", type: "number", min: 0.5, max: 4, step: 0.25, default: 1.5, description: "Outline width, in px." },
    { name: "lift", type: "number", min: 0, max: 0.4, step: 0.01, default: 0.08, description: "How far each letter rises on hover, in em." },
    { name: "stagger", type: "number", min: 0, max: 150, step: 5, default: 40, description: "Delay between letters, in ms." },
    { name: "duration", type: "number", min: 100, max: 2000, step: 50, default: 600, description: "Duration of each letter's sweep, in ms." },
    { name: "active", type: "boolean", default: false, description: "Keep the filled state on, e.g. to drive it from a parent." },
    { name: "strokeColor", type: "color", description: "Outline color in the resting state. Defaults to a faint foreground.", control: false },
  ],
  usage: `<FancyText text="Hover to fill" colors={["#a3e635", "#22d3ee", "#a78bfa"]} />`,
} satisfies Meta;
