import type { Meta } from "../../types";

export default {
  name: "Electric Border",
  category: "animations",
  description: "Wraps any element in crackling, glowing arcs of electricity that crawl around its edge.",
  props: [
    { name: "children", type: "node", description: "Content to electrify." },
    { name: "color", type: "color", default: "#7df9ff", description: "Arc and glow color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "chaos", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How far the arcs stray from the edge." },
    { name: "thickness", type: "number", min: 0.5, max: 6, step: 0.5, default: 2, description: "Line width in px." },
    { name: "radius", type: "number", min: 0, max: 64, step: 1, default: 24, description: "Corner radius in px." },
  ],
  usage: `<ElectricBorder color="#7df9ff" radius={24}>
  <div className="p-8">Charged up</div>
</ElectricBorder>`,
} satisfies Meta;
