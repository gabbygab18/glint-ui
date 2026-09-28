import type { Meta } from "../../types";

export default {
  name: "Masonry",
  category: "components",
  description: "Animated masonry image grid: tiles fly in with a staggered blur-to-focus, glide to new slots on resize and zoom on hover.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { src, ratio (height / width), alt?, href? }." },
    { name: "minColumnWidth", type: "number", min: 120, max: 400, step: 10, default: 220, description: "Columns are as many as fit at this minimum width, in px." },
    { name: "gap", type: "number", min: 0, max: 40, step: 2, default: 16, description: "Px between tiles." },
    { name: "stagger", type: "number", min: 0, max: 0.2, step: 0.01, default: 0.05, description: "Seconds between each tile's entrance." },
    { name: "animateFrom", type: "select", options: ["bottom", "top", "left", "right", "center"], default: "bottom", description: "Where tiles fly in from." },
    { name: "blurToFocus", type: "boolean", default: true, description: "Tiles start blurred and come into focus." },
    { name: "hoverScale", type: "number", min: 1, max: 1.3, step: 0.01, default: 1.08, description: "Image zoom on hover (1 disables)." },
  ],
  usage: `<Masonry items={[{ src: "/a.jpg", ratio: 1.4, alt: "Dunes" }, { src: "/b.jpg", ratio: 0.8 }]} />`,
} satisfies Meta;
