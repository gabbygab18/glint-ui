import type { Meta } from "../../types";

export default {
  name: "Fold Text",
  category: "text-animations",
  description: "Lines or letters swing open like creased paper in 3D, with a soft shadow lifting as each piece unfolds.",
  props: [
    { name: "lines", type: "list", default: ["Unfold", "the next", "big idea"], description: "One entry per line." },
    { name: "splitBy", type: "select", options: ["letters", "lines"], default: "letters", description: "Unfold each letter or whole lines." },
    { name: "trigger", type: "select", options: ["view", "hover", "loop"], default: "view", description: "Unfold once on view, refold and unfold on hover, or keep looping." },
    { name: "hinge", type: "select", options: ["top", "bottom"], default: "top", description: "Edge the paper hinges on." },
    { name: "stagger", type: "number", min: 0, max: 200, step: 5, default: 45, description: "Delay between pieces, in ms." },
    { name: "duration", type: "number", min: 200, max: 2500, step: 50, default: 1000, description: "Duration of each piece, in ms." },
  ],
  usage: `<FoldText lines={["Unfold", "the next", "big idea"]} trigger="hover" />`,
} satisfies Meta;
