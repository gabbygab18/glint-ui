import type { Meta } from "../../types";

export default {
  name: "Carousel",
  category: "components",
  description: "A draggable, snapping carousel whose off-center slides tilt away in 3D, with dots, autoplay and arrow-key support.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { image, title, description? }." },
    { name: "itemWidth", type: "number", min: 180, max: 420, step: 10, default: 300, description: "Slide width in px." },
    { name: "itemHeight", type: "number", min: 200, max: 480, step: 10, default: 340, description: "Slide height in px." },
    { name: "gap", type: "number", min: 0, max: 64, step: 2, default: 24, description: "Px between slides." },
    { name: "tilt", type: "number", min: 0, max: 70, step: 1, default: 38, description: "Max tilt of side slides in degrees." },
    { name: "autoplay", type: "boolean", default: false, description: "Advance automatically (pauses on hover)." },
    { name: "autoplayDelay", type: "number", min: 1000, max: 8000, step: 250, default: 3000, description: "Ms between autoplay steps." },
    { name: "loop", type: "boolean", default: true, description: "Wrap around at the ends." },
    { name: "startIndex", type: "number", min: 0, max: 5, step: 1, default: 0, control: false, description: "Slide centered on mount." },
  ],
  usage: `<Carousel
  items={[
    { image: "/a.jpg", title: "Mountains", description: "Thin air, big views." },
    { image: "/b.jpg", title: "Coast", description: "Salt and wind." },
  ]}
/>`,
} satisfies Meta;
