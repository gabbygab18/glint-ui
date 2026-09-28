import type { Meta } from "../../types";

export default {
  name: "Dodge Field",
  category: "micro-interactions",
  description: "A playful yes/no prompt whose No button springs away from the cursor, leaning into each hop, until it gets tired. Keyboard users can always press it.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "question", type: "string", default: "Deploy on a Friday afternoon?", description: "The question above the buttons." },
    { name: "yesLabel", type: "string", default: "Yes", description: "Yes button label." },
    { name: "noLabel", type: "string", default: "No", description: "No button label." },
    { name: "radius", type: "number", min: 40, max: 160, step: 5, default: 80, description: "Px around No in which the pointer makes it flee." },
    { name: "maxDodges", type: "number", min: 0, max: 30, step: 1, default: 8, description: "Dodges before No gives up (0 = never)." },
    { name: "color", type: "color", default: "#f472b6", description: "Yes button and celebration color." },
    { name: "onYes", type: "node", description: "Called when Yes is chosen." },
    { name: "onNo", type: "node", description: "Called when No is finally chosen." },
  ],
  usage: `<DodgeField
  question="Deploy on a Friday afternoon?"
  onYes={() => ship()}
  onNo={() => wait()}
/>`,
} satisfies Meta;
