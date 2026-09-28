import type { Meta } from "../../types";

export default {
  name: "Scroll Stack",
  category: "components",
  description: "Cards pin to the top of a scroll container and pile onto each other, with covered cards shrinking and dimming underneath.",
  props: [
    { name: "children", type: "node", description: "One child per card." },
    { name: "scrollContainerRef", type: "node", description: "Ref to the scrolling element. Defaults to the window." },
    { name: "stackOffset", type: "number", min: 0, max: 120, step: 4, default: 32, description: "Where the first card pins, in px from the top." },
    { name: "stackGap", type: "number", min: 0, max: 40, step: 1, default: 18, description: "Sliver of each earlier card left visible, in px." },
    { name: "itemGap", type: "number", min: 24, max: 240, step: 8, default: 96, description: "Space between cards before they stack, in px." },
    { name: "scaleStep", type: "number", min: 0, max: 0.15, step: 0.01, default: 0.05, description: "Shrink per card stacked on top." },
    { name: "dim", type: "number", min: 0, max: 0.9, step: 0.05, default: 0.45, description: "Darkness of a covered card." },
    { name: "blur", type: "number", min: 0, max: 6, step: 0.5, default: 0, description: "Blur per card on top, in px." },
    { name: "itemClassName", type: "node", description: "Classes for every card wrapper." },
  ],
  usage: `const box = useRef<HTMLDivElement>(null);

<div ref={box} className="h-[30rem] overflow-y-auto">
  <ScrollStack scrollContainerRef={box}>
    <div className="h-64 bg-lime-300 p-6">One</div>
    <div className="h-64 bg-violet-500 p-6">Two</div>
    <div className="h-64 bg-sky-500 p-6">Three</div>
  </ScrollStack>
</div>`,
} satisfies Meta;
