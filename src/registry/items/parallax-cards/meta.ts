import type { Meta } from "../../types";

export default {
  name: "Parallax Cards",
  category: "components",
  description: "A draggable, snapping row of photo cards whose images drift inside their frames as the row scrolls and tilt toward the pointer.",
  props: [
    { name: "items", type: "node", description: "Array of { image, title, subtitle?, tag? }." },
    { name: "cardWidth", type: "number", min: 180, max: 420, step: 10, default: 280, description: "Card width in px." },
    { name: "cardHeight", type: "number", min: 220, max: 520, step: 10, default: 380, description: "Card height in px." },
    { name: "gap", type: "number", min: 0, max: 60, step: 2, default: 20, description: "Px between cards." },
    { name: "intensity", type: "number", min: 0, max: 0.5, step: 0.01, default: 0.2, description: "How far photos drift while scrolling, as a fraction of card width." },
    { name: "tilt", type: "number", min: 0, max: 20, step: 1, default: 6, description: "Max pointer tilt in degrees." },
    { name: "fadeEdges", type: "boolean", default: true, description: "Fade the row out at both edges." },
  ],
  usage: `<ParallaxCards
  items={[
    { image: "/kyoto.jpg", title: "Kyoto", subtitle: "Japan", tag: "Culture" },
    { image: "/lofoten.jpg", title: "Lofoten", subtitle: "Norway", tag: "Nature" },
  ]}
/>`,
} satisfies Meta;
