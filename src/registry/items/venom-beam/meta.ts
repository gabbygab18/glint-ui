import type { Meta } from "../../types";

export default {
  name: "Venom Beam",
  category: "backgrounds",
  description: "A dark beam of oily, noise-driven tendrils writhing over a toxic green glow, shedding venom droplets. WebGL.",
  props: [
    { name: "color", type: "color", default: "#7dff3a", description: "Glow color around the tendrils." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Writhing speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Tendril detail; higher means tighter twists." },
    { name: "width", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Beam thickness multiplier." },
    { name: "tendrils", type: "number", min: 1, max: 10, step: 1, default: 7, description: "Number of tendrils." },
    { name: "intensity", type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1, description: "Glow brightness." },
  ],
  usage: `<div className="relative h-96">
  <VenomBeam color="#7dff3a" />
</div>`,
} satisfies Meta;
