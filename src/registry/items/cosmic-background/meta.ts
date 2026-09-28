import type { Meta } from "../../types";

export default {
  name: "Cosmic Background",
  category: "backgrounds",
  description: "Deep-space nebula clouds with parallax star layers, twinkling flares and the odd shooting star. WebGL.",
  props: [
    { name: "color", type: "color", default: "#6d28d9", description: "Main nebula color." },
    { name: "accent", type: "color", default: "#db2777", description: "Secondary nebula color." },
    { name: "speed", type: "number", min: 0, max: 5, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Size of the nebula clouds." },
    { name: "intensity", type: "number", min: 0, max: 2.5, step: 0.05, default: 1, description: "Nebula brightness." },
    { name: "stars", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Star density." },
    { name: "shootingStars", type: "boolean", default: true, description: "Show an occasional shooting star." },
  ],
  usage: `<div className="relative h-96">
  <CosmicBackground color="#6d28d9" accent="#db2777" />
</div>`,
} satisfies Meta;
