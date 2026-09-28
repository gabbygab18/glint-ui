import type { Meta } from "../../types";

export default {
  name: "Warm Tooltip",
  category: "micro-interactions",
  description: "A tooltip that springs out of its trigger with a soft bounce, then drifts and leans after the pointer on a warm glow. Opens on focus, closes on Escape.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "content", type: "string", default: "Add to favorites", description: "Tooltip text (any ReactNode)." },
    { name: "side", type: "select", options: ["top", "bottom"], default: "top", description: "Which side of the trigger." },
    { name: "delay", type: "number", min: 0, max: 1000, step: 25, default: 150, description: "Ms before opening." },
    { name: "follow", type: "number", min: 0, max: 1, step: 0.05, default: 0.3, description: "How far the bubble drifts toward the pointer." },
    { name: "glow", type: "color", default: "#fb923c", description: "Warm glow color." },
    { name: "children", type: "node", description: "One focusable trigger element; it gets aria-describedby while open." },
  ],
  usage: `<WarmTooltip content="Add to favorites">
  <button aria-label="Favorite"><Heart /></button>
</WarmTooltip>`,
} satisfies Meta;
