import type { Meta } from "../../types";

export default {
  name: "Plasma Wave",
  category: "backgrounds",
  description: "A glowing horizontal band of plasma wrapped in flickering electric filaments; it bends toward the cursor. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#38bdf8", description: "Color on one end of the band." },
    { name: "colorB", type: "color", default: "#a855f7", description: "Color on the other end." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "amplitude", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Wave height." },
    { name: "thickness", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Band thickness." },
    { name: "filaments", type: "number", min: 0, max: 12, step: 1, default: 6, description: "Electric filaments around the core." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Brightness." },
  ],
  usage: `<div className="relative h-96">
  <PlasmaWave colorA="#38bdf8" colorB="#a855f7" />
</div>`,
} satisfies Meta;
