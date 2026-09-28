import type { Meta } from "../../types";

export default {
  name: "Fluid Glass",
  category: "components",
  description: "A liquid glass lens that trails the cursor, magnifying and refracting the content beneath it with chromatic edges.",
  dependencies: ["motion", "react-use-measure"],
  props: [
    { name: "children", type: "node", description: "Content the lens floats over. Give it its own background." },
    { name: "size", type: "number", min: 80, max: 360, step: 10, default: 200, description: "Lens diameter in px." },
    { name: "zoom", type: "number", min: 1, max: 2.5, step: 0.05, default: 1.35, description: "Magnification inside the lens." },
    { name: "refraction", type: "number", min: 0, max: 160, step: 5, default: 60, description: "Px of edge refraction." },
    { name: "aberration", type: "number", min: 0, max: 20, step: 1, default: 6, description: "Px of chromatic split at the rim." },
    { name: "wobble", type: "boolean", default: true, description: "Squash and stretch the lens with its speed." },
  ],
  usage: `<FluidGlass className="h-[32rem]" size={200} zoom={1.35}>
  <YourContent />
</FluidGlass>`,
} satisfies Meta;
