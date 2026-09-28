import type { Meta } from "../../types";

export default {
  name: "Scroll Expand",
  category: "animations",
  description: "A media card that grows from an inset, rounded frame to full-bleed as you scroll, splitting its headline apart.",
  props: [
    { name: "src", type: "string", control: false, description: "Image URL." },
    { name: "title", type: "string", default: "Into the wild", description: "Headline; its halves slide apart as the media expands." },
    { name: "children", type: "node", description: "Content faded in once the media is full-bleed." },
    { name: "startInset", type: "number", min: 0, max: 40, step: 1, default: 24, description: "Starting inset as a percent of the width." },
    { name: "radius", type: "number", min: 0, max: 80, step: 2, default: 32, description: "Starting corner radius in px." },
    { name: "scrollLength", type: "number", min: 0.5, max: 4, step: 0.25, default: 1.5, description: "Scroll distance to fully expand, in viewport heights." },
    { name: "scrollContainerRef", type: "node", description: "Ref to the element that scrolls. Defaults to the window." },
  ],
  usage: `const box = useRef<HTMLDivElement>(null);\n\n<div ref={box} className="h-[32rem] overflow-y-auto">\n  <ScrollExpand src="/cover.jpg" title="Into the wild" scrollContainerRef={box}>\n    <p>Revealed at full size</p>\n  </ScrollExpand>\n</div>`,
} satisfies Meta;
