import type { Meta } from "../../types";

export default {
  name: "Chroma Grid",
  category: "components",
  description: "A grid of profile cards drained to grayscale, with a soft spotlight of full color that trails the cursor.",
  props: [
    { name: "items", type: "node", description: "Array of { image, title, subtitle?, handle?, color?, url? }." },
    { name: "radius", type: "number", min: 100, max: 600, step: 10, default: 280, description: "Spotlight radius in px." },
    { name: "smoothing", type: "number", min: 0.02, max: 1, step: 0.01, default: 0.12, description: "Follow smoothing (higher = snappier)." },
    { name: "columns", type: "number", min: 2, max: 5, step: 1, default: 3, description: "Grid columns." },
  ],
  usage: `<ChromaGrid
  items={[
    { image: "/ana.jpg", title: "Ana Reyes", subtitle: "Frontend Engineer", handle: "@ana", color: "#3b82f6" },
  ]}
/>`,
} satisfies Meta;
