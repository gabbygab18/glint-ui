import type { Meta } from "../../types";

export default {
  name: "Circular Gallery",
  category: "components",
  description: "An endless ribbon of images bent along an arc that you scroll, drag or arrow through, easing to a snap.",
  props: [
    { name: "items", type: "node", description: "Array of { image, text? }." },
    { name: "bend", type: "number", min: -8, max: 8, step: 0.5, default: 2, description: "Arc curvature. 0 is flat, negative flips it." },
    { name: "itemWidth", type: "number", min: 120, max: 400, step: 10, default: 240, description: "Card width in px." },
    { name: "itemHeight", type: "number", min: 120, max: 460, step: 10, default: 300, description: "Image height in px." },
    { name: "gap", type: "number", min: 0, max: 120, step: 2, default: 36, description: "Px between cards." },
    { name: "scrollSpeed", type: "number", min: 0.2, max: 4, step: 0.1, default: 1, description: "Wheel/drag multiplier." },
    { name: "ease", type: "number", min: 0.02, max: 0.4, step: 0.01, default: 0.08, description: "Follow easing (lower = floatier)." },
    { name: "autoScroll", type: "number", min: 0, max: 200, step: 2, default: 24, description: "Idle drift in px/s." },
    { name: "radius", type: "number", min: 0, max: 40, step: 1, default: 16, description: "Corner radius in px." },
  ],
  usage: `<CircularGallery items={[{ image: "/a.jpg", text: "Dawn" }, { image: "/b.jpg", text: "Dusk" }]} bend={2} />`,
} satisfies Meta;
