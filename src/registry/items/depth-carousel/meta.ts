import type { Meta } from "../../types";

export default {
  name: "Depth Carousel",
  category: "components",
  description: "A looping carousel where cards recede into 3D depth and blur the further they sit from center. Drag, click, arrows or keys.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { image, title, subtitle? }." },
    { name: "cardWidth", type: "number", min: 140, max: 400, step: 10, default: 250, description: "Card width in px." },
    { name: "cardHeight", type: "number", min: 160, max: 480, step: 10, default: 330, description: "Card height in px." },
    { name: "spacing", type: "number", min: 60, max: 360, step: 5, default: 170, description: "Px between card centers." },
    { name: "depth", type: "number", min: 0, max: 500, step: 10, default: 180, description: "Z px pushed back per step." },
    { name: "blur", type: "number", min: 0, max: 12, step: 0.5, default: 3, description: "Blur px added per step." },
    { name: "rotate", type: "number", min: 0, max: 60, step: 1, default: 18, description: "Y rotation of side cards in degrees." },
    { name: "visible", type: "number", min: 1, max: 4, step: 1, default: 2, description: "Cards shown per side." },
    { name: "autoplay", type: "boolean", default: true, description: "Advance automatically (pauses on hover)." },
    { name: "autoplayDelay", type: "number", min: 1000, max: 8000, step: 250, default: 3500, description: "Ms between steps." },
  ],
  usage: `<DepthCarousel
  items={[
    { image: "/a.jpg", title: "Aurora", subtitle: "Iceland, 2024" },
    { image: "/b.jpg", title: "Meridian", subtitle: "Chile, 2023" },
  ]}
/>`,
} satisfies Meta;
