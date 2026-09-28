import type { Meta } from "../../types";

export default {
  name: "Prismatic Burst",
  category: "backgrounds",
  description: "A radial burst of light rays pulsing outward from the center, split into rainbow fringes by chromatic dispersion. WebGL.",
  props: [
    { name: "tint", type: "color", default: "#ffffff", description: "Multiplies the ray colors." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "rays", type: "number", min: 4, max: 48, step: 1, default: 16, description: "Number of main rays." },
    { name: "dispersion", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Chromatic split strength." },
    { name: "pulse", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Outward pulse strength." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Brightness." },
    { name: "followMouse", type: "number", min: 0, max: 1, step: 0.05, default: 0.2, description: "How far the center drifts toward the cursor." },
  ],
  usage: `<div className="relative h-96">
  <PrismaticBurst rays={16} dispersion={1} />
</div>`,
} satisfies Meta;
