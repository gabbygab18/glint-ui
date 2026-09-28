import type { Meta } from "../../types";

export default {
  name: "Sticker Peel",
  category: "animations",
  description: "A glossy sticker whose corner curls back on hover and follows your drag, showing its paper back and a soft lifted shadow.",
  props: [
    { name: "children", type: "node", description: "The sticker face. Should fill the box." },
    { name: "corner", type: "select", options: ["bottom-right", "bottom-left", "top-right", "top-left"], default: "bottom-right", description: "Corner that lifts." },
    { name: "restPeel", type: "number", min: 0, max: 60, step: 1, default: 18, description: "Px the corner is lifted at rest, as a hint." },
    { name: "hoverPeel", type: "number", min: 0, max: 160, step: 2, default: 90, description: "Px the corner lifts on hover or focus." },
    { name: "backColor", type: "color", default: "#f4f4f5", description: "Color of the sticker's paper back." },
    { name: "radius", type: "number", min: 0, max: 120, step: 1, default: 28, description: "Corner radius in px; match your face." },
    { name: "label", type: "string", default: "Sticker. Press Enter to peel", description: "Accessible name." },
  ],
  usage: `<StickerPeel radius={28}>\n  <div className="size-64 rounded-[28px] bg-lime-300" />\n</StickerPeel>`,
} satisfies Meta;
