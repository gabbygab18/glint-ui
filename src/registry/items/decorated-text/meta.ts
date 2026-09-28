import type { Meta } from "../../types";

export default {
  name: "Decorated Text",
  category: "text-animations",
  description: "Frames a word with corner brackets, a dashed selection box and twinkling sparkles that draw in on view or hover.",
  props: [
    { name: "text", type: "string", default: "Design with intent", description: "Text to decorate." },
    { name: "decoration", type: "select", options: ["all", "brackets", "box", "sparkles"], default: "all", description: "Which decorations to draw." },
    { name: "trigger", type: "select", options: ["view", "hover"], default: "view", description: "Draw in when scrolled into view, or only while hovered." },
    { name: "color", type: "color", default: "#a3e635", description: "Decoration color." },
    { name: "duration", type: "number", min: 200, max: 3000, step: 50, default: 900, description: "Draw-in duration, in ms." },
  ],
  usage: `<DecoratedText text="Design with intent" decoration="all" />`,
} satisfies Meta;
