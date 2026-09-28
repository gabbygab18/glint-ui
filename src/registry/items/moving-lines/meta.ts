import type { Meta } from "../../types";

export default {
  name: "Moving Lines",
  category: "backgrounds",
  description: "Fine diagonal lines drift sideways while bright comets of light race along them. Canvas 2D.",
  props: [
    { name: "color", type: "color", default: "#71717a", description: "Base line color." },
    { name: "highlightColor", type: "color", default: "#67e8f9", description: "Color of the traveling highlights." },
    { name: "gap", type: "number", min: 8, max: 80, step: 1, default: 26, description: "Px between lines." },
    { name: "angle", type: "number", min: -90, max: 90, step: 1, default: 35, description: "Line angle in degrees." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "highlights", type: "number", min: 0, max: 12, step: 0.5, default: 2.5, description: "Highlights launched per second." },
  ],
  usage: `<div className="relative h-96">
  <MovingLines highlightColor="#67e8f9" />
</div>`,
} satisfies Meta;
