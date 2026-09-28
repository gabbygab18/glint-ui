import type { Meta } from "../../types";

export default {
  name: "Accordion Gallery",
  category: "components",
  description: "A row of image panels where the hovered or focused one glides open with its caption while the rest compress.",
  props: [
    { name: "items", type: "node", description: "Array of { src, title, subtitle? }." },
    { name: "height", type: "number", min: 200, max: 600, step: 10, default: 380, description: "Row height in px." },
    { name: "expandRatio", type: "number", min: 1.5, max: 10, step: 0.5, default: 5, description: "How many times wider the open panel is." },
    { name: "gap", type: "number", min: 0, max: 32, step: 1, default: 10, description: "Px between panels." },
    { name: "radius", type: "number", min: 0, max: 48, step: 1, default: 20, description: "Corner radius in px." },
    { name: "duration", type: "number", min: 200, max: 1500, step: 50, default: 700, description: "Transition length in ms." },
    { name: "defaultIndex", type: "number", min: 0, max: 5, step: 1, default: 0, description: "Panel open at rest." },
  ],
  usage: `<AccordionGallery
  items={[
    { src: "/alps.jpg", title: "Alps", subtitle: "Switzerland" },
    { src: "/fjord.jpg", title: "Fjords", subtitle: "Norway" },
  ]}
/>`,
} satisfies Meta;
