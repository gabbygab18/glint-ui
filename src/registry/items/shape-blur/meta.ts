import type { Meta } from "../../types";

export default {
  name: "Shape Blur",
  category: "animations",
  description: "A soft, glowing outline that snaps into razor focus wherever the cursor comes near. WebGL signed distance fields.",
  props: [
    { name: "shape", type: "select", options: ["rounded", "circle", "nested"], default: "nested", description: "Outline shape." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Outline color." },
    { name: "accent", type: "color", default: "#22d3ee", description: "Second color the outline shifts toward around its perimeter." },
    { name: "size", type: "number", min: 0.2, max: 0.95, step: 0.01, default: 0.62, description: "Shape size as a fraction of the shorter side." },
    { name: "thickness", type: "number", min: 0.5, max: 10, step: 0.5, default: 2, description: "Outline width in px when fully sharp." },
    { name: "blur", type: "number", min: 2, max: 80, step: 1, default: 26, description: "Blur radius in px away from the cursor." },
    { name: "focus", type: "number", min: 40, max: 500, step: 10, default: 170, description: "Px around the cursor where the outline comes into focus." },
  ],
  usage: `<div className="relative h-96">\n  <ShapeBlur shape="rounded" />\n</div>`,
} satisfies Meta;
