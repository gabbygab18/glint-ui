import type { Meta } from "../../types";

export default {
  name: "Animated Content",
  category: "animations",
  description: "Slides, scales and fades its children into place when they scroll into view.",
  props: [
    { name: "children", type: "node", description: "Content to reveal." },
    { name: "direction", type: "select", options: ["up", "down", "left", "right"], default: "up", description: "Direction the content travels as it enters." },
    { name: "distance", type: "number", min: 0, max: 300, step: 10, default: 80, description: "Px travelled on entry." },
    { name: "scale", type: "number", min: 0.5, max: 1.5, step: 0.02, default: 0.96, description: "Starting scale; 1 disables scaling." },
    { name: "initialOpacity", type: "number", min: 0, max: 1, step: 0.05, default: 0, description: "Starting opacity." },
    { name: "duration", type: "number", min: 100, max: 3000, step: 50, default: 900, description: "Duration in ms." },
    { name: "delay", type: "number", min: 0, max: 2000, step: 50, default: 0, description: "Ms to wait once in view." },
    { name: "ease", type: "select", options: ["smooth", "spring", "snappy", "linear"], default: "smooth", description: "Easing preset, or pass any CSS timing function." },
    { name: "threshold", type: "number", min: 0, max: 1, step: 0.05, default: 0.15, description: "Fraction of the element visible before it animates." },
    { name: "once", type: "boolean", default: true, description: "Animate only the first time it enters view." },
    { name: "scrollContainerRef", type: "node", description: "Ref to a scrolling ancestor. Defaults to the viewport." },
  ],
  usage: `<AnimatedContent direction="up" distance={80} ease="spring">
  <Card />
</AnimatedContent>`,
} satisfies Meta;
