import type { Meta } from "../../types";

export default {
  name: "Faulty Terminal",
  category: "backgrounds",
  description: "A scrolling wall of phosphor glyphs on a worn CRT, with scanlines, flicker, torn glitch bands and color fringing. WebGL.",
  props: [
    { name: "color", type: "color", default: "#33ff88", description: "Phosphor color." },
    { name: "scale", type: "number", min: 9, max: 48, step: 1, default: 18, description: "Character cell height in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Scroll and scramble speed multiplier." },
    { name: "glitch", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Glitch tearing and color fringing." },
    { name: "flicker", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Brightness flicker." },
    { name: "curvature", type: "number", min: 0, max: 1.5, step: 0.05, default: 0.4, description: "Tube curvature." },
  ],
  usage: `<div className="relative h-96">
  <FaultyTerminal color="#33ff88" />
</div>`,
} satisfies Meta;
