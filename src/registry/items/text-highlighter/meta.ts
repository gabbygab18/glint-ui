import type { Meta } from "../../types";

export default {
  name: "Text Highlighter",
  category: "text-animations",
  description: "A marker-pen stroke swipes behind chosen words as they scroll into view, flipping the ink color in sync.",
  props: [
    { name: "children", type: "node", description: "The words to highlight." },
    { name: "color", type: "color", default: "#a3e635", description: "Marker color." },
    { name: "textColor", type: "color", default: "#0a0a0a", description: "Text color while highlighted (marker variant)." },
    { name: "variant", type: "select", options: ["marker", "underline"], default: "marker", description: "Full marker stroke, or a low underline swipe." },
    { name: "direction", type: "select", options: ["ltr", "rtl"], default: "ltr", description: "Direction the pen travels." },
    { name: "duration", type: "number", min: 200, max: 3000, step: 50, default: 900, description: "Stroke duration, in ms." },
    { name: "delay", type: "number", min: 0, max: 3000, step: 50, default: 0, description: "Delay after entering view, in ms." },
  ],
  usage: `<p>Ship <TextHighlighter>small, sharp</TextHighlighter> releases.</p>`,
} satisfies Meta;
