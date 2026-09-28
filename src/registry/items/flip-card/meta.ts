import type { Meta } from "../../types";

export default {
  name: "Flip Card",
  category: "micro-interactions",
  description: "A small flash card that lifts off the table and springs over toward the side you tap, with a shadow that shrinks mid-turn. Enter or Space flips it too.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "front", type: "string", default: "What does the “C” in CSS stand for?", description: "Front face content." },
    { name: "back", type: "string", default: "Cascading. Later rules win when specificity ties.", description: "Back face content." },
    { name: "frontLabel", type: "string", default: "Question", description: "Caption on the front." },
    { name: "backLabel", type: "string", default: "Answer", description: "Caption on the back." },
    { name: "color", type: "color", default: "#818cf8", description: "Accent color of the back face." },
    { name: "defaultFlipped", type: "boolean", default: false, description: "Start showing the back." },
    { name: "flipped", type: "node", description: "Controlled flipped state. Pair with onFlip." },
    { name: "onFlip", type: "node", description: "Called with the new state on every flip." },
  ],
  usage: `<FlipCard
  front="What does the “C” in CSS stand for?"
  back="Cascading."
  onFlip={(showingBack) => track(showingBack)}
/>`,
} satisfies Meta;
