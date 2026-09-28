import type { Meta } from "../../types";

export default {
  name: "Scroll Float",
  category: "text-animations",
  description: "Characters stretch, rise and fade into place one after another, scrubbed by scroll position inside any scroll container.",
  props: [
    { name: "text", type: "string", default: "Scroll to float", description: "Text to animate." },
    { name: "start", type: "number", min: 0.3, max: 1.2, step: 0.05, default: 0.95, description: "Animation starts when the text top reaches this fraction of the viewport height." },
    { name: "end", type: "number", min: 0, max: 0.9, step: 0.05, default: 0.45, description: "Every character has landed at this fraction of the viewport height." },
    { name: "stagger", type: "number", min: 0, max: 0.2, step: 0.01, default: 0.04, description: "Progress offset between consecutive characters." },
    { name: "scrollContainerRef", type: "node", description: "Ref to the scrolling element. Defaults to the window." },
    { name: "as", type: "select", options: ["h1", "h2", "h3", "p", "div"], default: "h2", description: "Element to render.", control: false },
  ],
  usage: `const scroller = useRef<HTMLDivElement>(null);

<div ref={scroller} className="h-96 overflow-y-auto">
  <div className="h-80" />
  <ScrollFloat text="Scroll to float" scrollContainerRef={scroller} />
</div>`,
} satisfies Meta;
