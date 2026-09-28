import type { Meta } from "../../types";

export default {
  name: "Light Tunnel",
  category: "backgrounds",
  description: "An endless flight through a bending tunnel of glowing rings and spark-lit lines. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#38bdf8", description: "First ring color." },
    { name: "colorB", type: "color", default: "#f472b6", description: "Second ring color, blended by depth." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flight speed multiplier." },
    { name: "density", type: "number", min: 0.5, max: 6, step: 0.1, default: 2, description: "Rings per unit of depth." },
    { name: "lines", type: "number", min: 0, max: 48, step: 1, default: 16, description: "Lengthwise lines; 0 hides them." },
    { name: "twist", type: "number", min: -4, max: 4, step: 0.1, default: 1, description: "Spiral of the lengthwise lines." },
    { name: "glow", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Line glow strength." },
    { name: "interactive", type: "boolean", default: true, description: "Vanishing point drifts toward the cursor." },
  ],
  usage: `<div className="relative h-96">
  <LightTunnel colorA="#38bdf8" colorB="#f472b6" />
</div>`,
} satisfies Meta;
