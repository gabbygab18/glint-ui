import type { Meta } from "../../types";

export default {
  name: "Tooltip",
  category: "primitives",
  description: "Hover and focus tooltip in the native top layer: open delay with instant hand-off between neighbors, auto-flip placement, a tracking arrow and a springy fade-scale.",
  isNew: true,
  props: [
    { name: "side", type: "select", options: ["top", "right", "bottom", "left"], default: "top", description: "Preferred side; flips when there is no room." },
    { name: "delay", type: "number", min: 0, max: 1500, step: 50, default: 500, description: "Hover delay before opening (ms)." },
    { name: "sideOffset", type: "number", min: 0, max: 24, step: 1, default: 8, description: "Gap between trigger and bubble (px)." },
    { name: "arrow", type: "boolean", default: true, description: "Show the arrow." },
    { name: "content", type: "node", description: "Tooltip text or node." },
    { name: "children", type: "node", description: "A single focusable trigger element." },
    { name: "open", type: "node", description: "Controlled open state (with onOpenChange)." },
  ],
  usage: `<Tooltip content="Copy link" side="top">
  <button aria-label="Copy link"><Link2 /></button>
</Tooltip>`,
} satisfies Meta;
