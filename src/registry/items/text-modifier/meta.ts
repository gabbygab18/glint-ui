import type { Meta } from "../../types";

export default {
  name: "Text Modifier",
  category: "text-animations",
  description: "Hand-drawn pen annotations (circles, underlines, boxes, strikes and crosses) that sketch themselves around words.",
  props: [
    { name: "children", type: "node", description: "The words to annotate." },
    { name: "action", type: "select", options: ["circle", "underline", "box", "strike", "cross"], default: "circle", description: "Annotation to draw." },
    { name: "color", type: "color", default: "#fb7185", description: "Pen color." },
    { name: "strokeWidth", type: "number", min: 1, max: 10, step: 0.5, default: 3, description: "Pen width, in px." },
    { name: "padding", type: "number", min: 0, max: 30, step: 1, default: 8, description: "Space between the text and the annotation, in px." },
    { name: "duration", type: "number", min: 200, max: 3000, step: 50, default: 900, description: "Draw duration, in ms." },
    { name: "delay", type: "number", min: 0, max: 3000, step: 50, default: 0, description: "Delay after entering view, in ms." },
    { name: "seed", type: "number", min: 1, max: 50, step: 1, default: 3, description: "Changes the hand-drawn wobble." },
  ],
  usage: `<p>Make it <TextModifier action="circle">pop</TextModifier>.</p>`,
} satisfies Meta;
