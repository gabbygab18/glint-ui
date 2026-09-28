import type { Meta } from "../../types";

export default {
  name: "Scroll Reveal",
  category: "text-animations",
  description: "A paragraph whose words sharpen from dim and blurred to crisp as it scrolls through view.",
  props: [
    {
      name: "text",
      type: "string",
      default:
        "Good motion is a quiet language. Every fade and every shift in focus tells the reader where to look next, and when it is done right nobody notices the craft, only the clarity.",
      description: "Paragraph to reveal.",
    },
    { name: "baseOpacity", type: "number", min: 0, max: 1, step: 0.05, default: 0.12, description: "Opacity of words not revealed yet." },
    { name: "blur", type: "number", min: 0, max: 20, step: 1, default: 8, description: "Blur of unrevealed words, in px." },
    { name: "softness", type: "number", min: 1, max: 20, step: 1, default: 6, description: "How many words transition at once." },
    { name: "rotation", type: "number", min: 0, max: 10, step: 0.5, default: 3, description: "Starting tilt in degrees, settles to 0." },
    { name: "scrollContainerRef", type: "node", description: "Ref to the scrolling element. Defaults to the window." },
    { name: "as", type: "select", options: ["p", "h2", "h3", "div"], default: "p", description: "Element to render.", control: false },
  ],
  usage: `const box = useRef<HTMLDivElement>(null);

<div ref={box} className="h-96 overflow-y-auto">
  <ScrollReveal scrollContainerRef={box} text="Good motion is a quiet language..." />
</div>`,
} satisfies Meta;
