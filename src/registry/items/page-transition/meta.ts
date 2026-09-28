import type { Meta } from "../../types";

export default {
  name: "Page Transition",
  category: "animations",
  description: "A staggered, layered column curtain that covers the old view, swaps content, then sweeps away to reveal the new one.",
  props: [
    { name: "transitionKey", type: "string", control: false, description: "Change it (tab id, route) to play the transition." },
    { name: "children", type: "node", description: "The current view." },
    { name: "columns", type: "number", min: 1, max: 12, step: 1, default: 5, description: "Curtain columns; 1 is a plain wipe." },
    { name: "colors", type: "list", default: ["#c6ff3d", "#18181b"], description: "Curtain layers, back to front." },
    { name: "duration", type: "number", min: 150, max: 1500, step: 50, default: 550, description: "Ms for each half." },
    { name: "stagger", type: "number", min: 0, max: 200, step: 5, default: 55, description: "Ms between columns." },
    { name: "direction", type: "select", options: ["up", "down"], default: "up", description: "Direction the curtain travels." },
  ],
  usage: `<PageTransition transitionKey={tab}>
  {views[tab]}
</PageTransition>`,
} satisfies Meta;
