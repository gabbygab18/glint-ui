import type { Meta } from "../../types";

export default {
  name: "Circular Text",
  category: "text-animations",
  description: "Text wrapped around a slowly spinning ring that speeds up, slows down or stops when hovered, with optional content in the middle.",
  props: [
    { name: "text", type: "string", default: "GLINT • MOTION • COMPONENTS • ", description: "Text around the ring. Trailing separator keeps the loop seamless." },
    { name: "spinDuration", type: "number", min: 2, max: 60, step: 1, default: 20, description: "Seconds per full turn." },
    { name: "onHover", type: "select", options: ["none", "speedUp", "slowDown", "pause", "goBonkers"], default: "speedUp", description: "What hovering does to the spin." },
    { name: "size", type: "number", min: 120, max: 420, step: 10, default: 220, description: "Diameter in px." },
    { name: "children", type: "node", description: "Optional content in the middle of the ring." },
  ],
  usage: `<CircularText text="GLINT • MOTION • COMPONENTS • " onHover="speedUp">
  <Logo />
</CircularText>`,
} satisfies Meta;
