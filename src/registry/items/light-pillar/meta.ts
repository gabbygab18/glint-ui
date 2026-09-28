import type { Meta } from "../../types";

export default {
  name: "Light Pillar",
  category: "backgrounds",
  description: "A tall column of light filled with slowly swirling volumetric smoke. WebGL.",
  props: [
    { name: "topColor", type: "color", default: "#a78bfa", description: "Color at the top of the pillar." },
    { name: "bottomColor", type: "color", default: "#22d3ee", description: "Color at the bottom of the pillar." },
    { name: "width", type: "number", min: 0.05, max: 1, step: 0.01, default: 0.32, description: "Width as a fraction of the container height." },
    { name: "intensity", type: "number", min: 0.1, max: 3, step: 0.1, default: 1, description: "Brightness." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "twist", type: "number", min: 0, max: 8, step: 0.1, default: 2.5, description: "How much the smoke swirls around the axis." },
    { name: "angle", type: "number", min: -90, max: 90, step: 1, default: 0, description: "Rotation in degrees." },
  ],
  usage: `<div className="relative h-96">
  <LightPillar topColor="#a78bfa" bottomColor="#22d3ee" />
</div>`,
} satisfies Meta;
