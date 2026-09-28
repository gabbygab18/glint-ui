import type { Meta } from "../../types";

export default {
  name: "Dual Sparks",
  category: "backgrounds",
  description: "Two streams of sparks rush in from opposite edges and burst against each other in a glowing core. Canvas 2D.",
  props: [
    { name: "leftColor", type: "color", default: "#38bdf8", description: "Color of the stream entering from the left." },
    { name: "rightColor", type: "color", default: "#f472b6", description: "Color of the stream entering from the right." },
    { name: "density", type: "number", min: 10, max: 250, step: 5, default: 90, description: "Sparks spawned per second on each side." },
    { name: "speed", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "glow", type: "number", min: 0, max: 2, step: 0.05, default: 1, description: "Brightness of the collision glow." },
    { name: "spread", type: "number", min: 0.05, max: 1, step: 0.05, default: 0.5, description: "How far the streams fan out vertically." },
  ],
  usage: `<div className="relative h-96">
  <DualSparks leftColor="#38bdf8" rightColor="#f472b6" />
</div>`,
} satisfies Meta;
