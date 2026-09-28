import type { Meta } from "../../types";

export default {
  name: "Molten Metal",
  category: "backgrounds",
  description: "Slowly drifting plates of dark crust split by white-hot, pulsing cracks of molten metal. WebGL.",
  props: [
    { name: "crustColor", type: "color", default: "#1c100c", description: "Cooled crust color." },
    { name: "glowColor", type: "color", default: "#ff4d12", description: "Deep molten glow." },
    { name: "hotColor", type: "color", default: "#ffc861", description: "Hottest crack color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "scale", type: "number", min: 1, max: 10, step: 0.1, default: 3, description: "Plate density; higher gives smaller plates." },
    { name: "crackWidth", type: "number", min: 0.01, max: 0.3, step: 0.01, default: 0.08, description: "Width of the glowing cracks." },
    { name: "intensity", type: "number", min: 0.2, max: 2, step: 0.05, default: 1, description: "Heat and brightness." },
  ],
  usage: `<div className="relative h-96">
  <MoltenMetal glowColor="#ff4d12" hotColor="#ffc861" />
</div>`,
} satisfies Meta;
