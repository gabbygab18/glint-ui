import type { Meta } from "../../types";

export default {
  name: "Reaction Bar",
  category: "micro-interactions",
  description: "A reaction button whose emoji tray springs open on hover or click. The emoji under the pointer lifts and names itself, and the one you pick pops onto the button. Arrow keys and Escape work.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "React", description: "Button text while nothing is picked." },
    { name: "hover", type: "boolean", default: true, description: "Open the tray on hover as well as on click." },
    { name: "reactions", type: "node", description: "Array of { emoji, label }." },
    { name: "value", type: "node", description: "Controlled selection (label or null), pair with onChange." },
  ],
  usage: `<ReactionBar value={reaction} onChange={setReaction} />`,
} satisfies Meta;
