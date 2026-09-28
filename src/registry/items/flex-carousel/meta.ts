import type { Meta } from "../../types";

export default {
  name: "Flex Carousel",
  category: "components",
  description: "Row of photo panels where the active one flex-grows open while the rest shrink, auto-advancing with a progress bar.",
  props: [
    { name: "items", type: "node", description: "Array of { image, title, description? }." },
    { name: "interval", type: "number", min: 1500, max: 12000, step: 250, default: 5000, description: "Ms each panel stays open." },
    { name: "autoPlay", type: "boolean", default: true, description: "Advance automatically; pauses on hover." },
    { name: "expand", type: "number", min: 2, max: 12, step: 0.5, default: 6, description: "Width of the open panel vs a closed one." },
    { name: "gap", type: "number", min: 0, max: 32, step: 2, default: 10, description: "Px between panels." },
    { name: "height", type: "number", min: 240, max: 640, step: 10, default: 420, description: "Height in px." },
  ],
  usage: `<FlexCarousel
  items={[
    { image: "/alps.jpg", title: "Alpine Lakes", description: "Glacial water, still air." },
    { image: "/coast.jpg", title: "Coastline" },
  ]}
/>`,
} satisfies Meta;
