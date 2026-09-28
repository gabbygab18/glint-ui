import type { Meta } from "../../types";

export default {
  name: "Bars Wave",
  category: "backgrounds",
  description: "A row of glowing equalizer bars whose heights roll across the screen as a layered wave. Canvas 2D.",
  props: [
    { name: "color", type: "color", default: "#67e8f9", description: "Color at the tops of the bars." },
    { name: "accent", type: "color", default: "#7c3aed", description: "Color at the base of the bars." },
    { name: "bars", type: "number", min: 8, max: 160, step: 1, default: 64, description: "Number of bars across the width." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Wave speed multiplier." },
    { name: "amplitude", type: "number", min: 0.1, max: 1, step: 0.05, default: 0.6, description: "Wave height as a fraction of the container." },
    { name: "glow", type: "number", min: 0, max: 2, step: 0.1, default: 1, description: "Glow strength." },
  ],
  usage: `<div className="relative h-96">
  <BarsWave color="#67e8f9" accent="#7c3aed" />
</div>`,
} satisfies Meta;
