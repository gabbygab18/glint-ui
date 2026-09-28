import type { Meta } from "../../types";

export default {
  name: "Scroll Area",
  category: "primitives",
  description: "Native scrolling with slim overlay scrollbars that fade in on hover or scroll, draggable thumbs and soft fading edges where there is more to see.",
  isNew: true,
  props: [
    { name: "type", type: "select", options: ["hover", "scroll", "always"], default: "hover", description: "When the scrollbars are visible." },
    { name: "orientation", type: "select", options: ["vertical", "horizontal", "both"], default: "vertical", description: "Scroll axes." },
    { name: "fade", type: "boolean", default: true, description: "Fade content at edges with more to scroll." },
    { name: "fadeSize", type: "number", min: 8, max: 80, step: 4, default: 32, description: "Fade length in px." },
    { name: "viewportClassName", type: "node", description: "Classes for the scrolling viewport." },
  ],
  usage: `<ScrollArea className="h-72 w-56 rounded-xl border">
  {items.map((item) => <div key={item}>{item}</div>)}
</ScrollArea>`,
} satisfies Meta;
