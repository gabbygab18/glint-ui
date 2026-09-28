import type { Meta } from "../../types";

export default {
  name: "Luminescent Flows",
  category: "backgrounds",
  description: "Glowing currents drift like bioluminescent tides, with light pulses traveling along them and specks of plankton. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#2dd4bf", description: "First current color." },
    { name: "colorB", type: "color", default: "#818cf8", description: "Second current color." },
    { name: "count", type: "number", min: 1, max: 12, step: 1, default: 7, description: "Number of glowing currents." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "scale", type: "number", min: 0.4, max: 2.5, step: 0.05, default: 1, description: "Size of the curves." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.05, default: 1, description: "Overall brightness." },
  ],
  usage: `<div className="relative h-96">
  <LuminescentFlows colorA="#2dd4bf" colorB="#818cf8" />
</div>`,
} satisfies Meta;
