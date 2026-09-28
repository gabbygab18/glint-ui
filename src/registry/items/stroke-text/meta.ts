import type { Meta } from "../../types";

export default {
  name: "Stroke Text",
  category: "text-animations",
  description: "Outlined lettering that draws its stroke, then wipes in a solid fill on view or on hover.",
  props: [
    { name: "text", type: "string", default: "Outline", description: "Text to draw." },
    { name: "strokeColor", type: "color", default: "#bef264", description: "Outline color." },
    { name: "fillColor", type: "color", default: "#ecfccb", description: "Fill color." },
    { name: "strokeWidth", type: "number", min: 0.2, max: 5, step: 0.1, default: 1.2, description: "Outline thickness, % of font size." },
    { name: "duration", type: "number", min: 500, max: 6000, step: 100, default: 2200, description: "Ms for draw and fill." },
    { name: "trigger", type: "select", options: ["view", "hover"], default: "view", description: "Fill on view or while hovered." },
  ],
  usage: `<StrokeText text="Outline" className="text-8xl font-black" />`,
} satisfies Meta;
