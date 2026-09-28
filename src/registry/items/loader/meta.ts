import type { Meta } from "../../types";

export default {
  name: "Loader",
  category: "micro-interactions",
  description: "Five small, clean loaders in one component: a stretching arc spinner, squashy hopping dots, equalizer bars, a heartbeat pulse and bunching orbit dots.",
  isNew: true,
  props: [
    { name: "variant", type: "select", options: ["spinner", "dots", "bars", "pulse", "orbit"], default: "spinner", description: "Which loader to draw." },
    { name: "size", type: "number", min: 12, max: 96, step: 2, default: 32, description: "Box size in px." },
    { name: "color", type: "string", default: "currentColor", description: "Any CSS color; inherits the text color by default." },
    { name: "speed", type: "number", min: 0.25, max: 3, step: 0.05, default: 1, description: "Speed multiplier." },
    { name: "label", type: "string", default: "Loading", description: "Screen reader text." },
  ],
  usage: `<Loader variant="dots" size={24} />`,
} satisfies Meta;
