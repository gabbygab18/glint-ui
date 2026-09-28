import type { Meta } from "../../types";

export default {
  name: "Web Threads",
  category: "backgrounds",
  description: "A spider web of silk threads swaying in a breeze; the cursor stretches them and they ripple as they spring back.",
  props: [
    { name: "spokes", type: "number", min: 6, max: 36, step: 1, default: 18, description: "Number of radial threads." },
    { name: "rings", type: "number", min: 4, max: 32, step: 1, default: 16, description: "Rings between hub and edges." },
    { name: "color", type: "color", default: "#a1a1aa", description: "Idle silk color." },
    { name: "activeColor", type: "color", default: "#67e8f9", description: "Color of stretched, vibrating threads." },
    { name: "radius", type: "number", min: 40, max: 400, step: 10, default: 140, description: "Px radius the cursor pushes within." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Ambient breeze speed." },
  ],
  usage: `<div className="relative h-96">
  <WebThreads spokes={18} rings={16} />
</div>`,
} satisfies Meta;
