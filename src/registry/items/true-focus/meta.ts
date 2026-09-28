import type { Meta } from "../../types";

export default {
  name: "True Focus",
  category: "text-animations",
  description: "One word at a time snaps into focus inside gliding corner brackets while the rest of the sentence blurs.",
  props: [
    { name: "text", type: "string", default: "Focus on what matters", description: "Sentence to split into words." },
    { name: "blur", type: "number", min: 0, max: 15, step: 0.5, default: 5, description: "Blur of unfocused words, in px." },
    { name: "interval", type: "number", min: 500, max: 5000, step: 100, default: 1800, description: "Ms per word in auto mode." },
    { name: "duration", type: "number", min: 100, max: 1500, step: 50, default: 550, description: "Ms for the frame to travel." },
    { name: "mode", type: "select", options: ["auto", "hover"], default: "auto", description: "Cycle on its own or follow the pointer." },
    { name: "color", type: "color", default: "#bef264", description: "Corner bracket color." },
  ],
  usage: `<TrueFocus text="Focus on what matters" mode="auto" />`,
} satisfies Meta;
