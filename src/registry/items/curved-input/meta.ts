import type { Meta } from "../../types";

export default {
  name: "Curved Input",
  category: "components",
  description: "A text field whose words and underline droop along an arc while idle, then spring flat the moment you focus it.",
  dependencies: ["motion"],
  props: [
    { name: "width", type: "number", min: 200, max: 640, step: 10, default: 380, description: "Width in px." },
    { name: "fontSize", type: "number", min: 14, max: 56, step: 1, default: 30, description: "Text size in px." },
    { name: "bend", type: "number", min: -80, max: 80, step: 2, default: 40, description: "Idle sag of the arc in px. Negative arcs upward." },
    { name: "placeholder", type: "string", default: "Type your name", description: "Placeholder text (also curved)." },
    { name: "defaultValue", type: "string", default: "", description: "Initial text." },
    { name: "label", type: "string", default: "Name", description: "Accessible label." },
    { name: "colorFrom", type: "color", default: "#a78bfa", description: "Underline gradient start." },
    { name: "colorTo", type: "color", default: "#22d3ee", description: "Underline gradient end." },
    { name: "onValueChange", type: "node", description: "(value: string) => void." },
  ],
  usage: `<CurvedInput placeholder="Type your name" bend={40} />`,
} satisfies Meta;
