import type { Meta } from "../../types";

export default {
  name: "Lightfall",
  category: "backgrounds",
  description: "Streaks of light falling like rain across three depth layers, each with a glowing head and fading trail. WebGL.",
  props: [
    { name: "colorA", type: "color", default: "#67e8f9", description: "First streak color." },
    { name: "colorB", type: "color", default: "#a78bfa", description: "Second streak color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Fall speed multiplier." },
    { name: "density", type: "number", min: 3, max: 40, step: 1, default: 12, description: "Columns per container height (front layer)." },
    { name: "length", type: "number", min: 0.05, max: 1.5, step: 0.05, default: 0.35, description: "Trail length, in container heights." },
    { name: "glow", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Brightness and bloom." },
  ],
  usage: `<div className="relative h-96">
  <Lightfall colorA="#67e8f9" colorB="#a78bfa" />
</div>`,
} satisfies Meta;
