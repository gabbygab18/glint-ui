import type { Meta } from "../../types";

export default {
  name: "Slide Text",
  category: "text-animations",
  description: "On hover every letter rolls out of view and a fresh copy slides in behind it, in a staggered wave.",
  props: [
    { name: "text", type: "string", default: "Let's talk", description: "Text to render." },
    { name: "hoverColor", type: "color", default: "#a3e635", description: "Color of the incoming letters." },
    { name: "direction", type: "select", options: ["up", "down"], default: "up", description: "Direction the letters travel." },
    { name: "from", type: "select", options: ["start", "center", "end"], default: "start", description: "Where the stagger starts." },
    { name: "stagger", type: "number", min: 0, max: 120, step: 5, default: 25, description: "Delay between letters, in ms." },
    { name: "duration", type: "number", min: 100, max: 1500, step: 50, default: 500, description: "Slide duration of each letter, in ms." },
    { name: "active", type: "boolean", default: false, description: "Keep the swapped state, e.g. for an active link." },
  ],
  usage: `<a href="/contact"><SlideText text="Let's talk" hoverColor="#a3e635" /></a>`,
} satisfies Meta;
