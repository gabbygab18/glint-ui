import type { Meta } from "../../types";

export default {
  name: "Depth Text",
  category: "text-animations",
  description: "Chunky extruded 3D lettering built from stacked layers that tilts toward the pointer and sways gently when idle.",
  props: [
    { name: "text", type: "string", default: "DEPTH", description: "Text to extrude." },
    { name: "layers", type: "number", min: 2, max: 40, step: 1, default: 20, description: "Number of stacked copies forming the extrusion." },
    { name: "depth", type: "number", min: 0.5, max: 8, step: 0.5, default: 3, description: "Gap between copies, in px." },
    { name: "maxTilt", type: "number", min: 0, max: 45, step: 1, default: 24, description: "Maximum tilt toward the pointer, in degrees." },
    { name: "color", type: "color", default: "#ecfccb", description: "Front face color." },
    { name: "depthColor", type: "color", default: "#1a2e05", description: "Color of the deepest layer." },
  ],
  usage: `<DepthText text="DEPTH" layers={16} className="text-8xl font-black" />`,
} satisfies Meta;
