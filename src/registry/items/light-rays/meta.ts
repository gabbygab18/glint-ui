import type { Meta } from "../../types";

export default {
  name: "Light Rays",
  category: "backgrounds",
  description: "Soft god rays streaming from an edge or corner, swaying gently and leaning toward the cursor. WebGL.",
  props: [
    {
      name: "origin",
      type: "select",
      options: ["top-center", "top-left", "top-right", "left", "right", "bottom-center", "center"],
      default: "top-center",
      description: "Where the rays come from.",
    },
    { name: "color", type: "color", default: "#d9f0ff", description: "Ray color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "spread", type: "number", min: 0.1, max: 1.6, step: 0.05, default: 0.6, description: "Cone half-width in radians." },
    { name: "length", type: "number", min: 0.2, max: 4, step: 0.1, default: 1.2, description: "Reach, in container heights." },
    { name: "intensity", type: "number", min: 0.1, max: 3, step: 0.1, default: 1, description: "Brightness." },
    { name: "followMouse", type: "number", min: 0, max: 1, step: 0.05, default: 0.4, description: "How much the beam leans toward the cursor." },
  ],
  usage: `<div className="relative h-96">
  <LightRays origin="top-center" color="#d9f0ff" />
</div>`,
} satisfies Meta;
