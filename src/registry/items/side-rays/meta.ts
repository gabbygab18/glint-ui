import type { Meta } from "../../types";

export default {
  name: "Side Rays",
  category: "backgrounds",
  description: "Warm light slanting in from one side through window blinds, with dust motes glinting in the beams. WebGL.",
  props: [
    { name: "color", type: "color", default: "#ffe2b8", description: "Light color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "side", type: "select", options: ["left", "right"], default: "left", description: "Edge the light enters from." },
    { name: "angle", type: "number", min: -0.8, max: 0.8, step: 0.05, default: 0.35, description: "Downward tilt in radians." },
    { name: "slats", type: "number", min: 2, max: 20, step: 1, default: 7, description: "Blind slats across the height." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Brightness." },
    { name: "dust", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Amount of floating dust." },
  ],
  usage: `<div className="relative h-96">
  <SideRays side="left" angle={0.35} />
</div>`,
} satisfies Meta;
