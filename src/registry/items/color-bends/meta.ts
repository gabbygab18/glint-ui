import type { Meta } from "../../types";

export default {
  name: "Color Bends",
  category: "backgrounds",
  description: "Smooth ribbons of color that bend, fold and drift; the cursor gently warps them like a lens. WebGL.",
  props: [
    {
      name: "colors",
      type: "list",
      default: ["#ff5e3a", "#ff2d95", "#7a5cff", "#00c2ff"],
      description: "Up to four colors the bands flow through.",
    },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Zoom; higher means wider bends." },
    { name: "bands", type: "number", min: 0.5, max: 8, step: 0.5, default: 3, description: "Number of bands across the view." },
    { name: "warp", type: "number", min: 0, max: 2, step: 0.1, default: 1, description: "How strongly the cursor warps the bands." },
  ],
  usage: `<div className="relative h-96">
  <ColorBends bands={3} />
</div>`,
} satisfies Meta;
