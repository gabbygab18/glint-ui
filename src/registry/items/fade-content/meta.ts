import type { Meta } from "../../types";

export default {
  name: "Fade Content",
  category: "animations",
  description: "Fades and un-blurs its children as they scroll into view, like a lens pulling focus.",
  props: [
    { name: "children", type: "node", description: "Content to reveal." },
    { name: "blur", type: "number", min: 0, max: 40, step: 1, default: 12, description: "Starting blur in px." },
    { name: "duration", type: "number", min: 100, max: 3000, step: 50, default: 1000, description: "Duration in ms." },
    { name: "delay", type: "number", min: 0, max: 2000, step: 50, default: 0, description: "Ms to wait once in view." },
    { name: "easing", type: "select", options: ["ease-out", "ease-in-out", "ease", "linear"], default: "ease-out", description: "Any CSS timing function." },
    { name: "initialOpacity", type: "number", min: 0, max: 1, step: 0.05, default: 0, description: "Starting opacity." },
    { name: "threshold", type: "number", min: 0, max: 1, step: 0.05, default: 0.2, description: "Fraction of the element visible before it fades in." },
    { name: "once", type: "boolean", default: true, description: "Fade only the first time it enters view." },
    { name: "scrollContainerRef", type: "node", description: "Ref to a scrolling ancestor. Defaults to the viewport." },
  ],
  usage: `<FadeContent blur={12} duration={1000}>
  <img src="/photo.jpg" alt="" />
</FadeContent>`,
} satisfies Meta;
