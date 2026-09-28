import type { Meta } from "../../types";

export default {
  name: "Column Lines",
  category: "backgrounds",
  description: "Evenly spaced column lines with colored light pulses falling down them at random. Canvas 2D.",
  props: [
    { name: "colors", type: "list", default: ["#a78bfa", "#f472b6", "#38bdf8"], description: "Pulse colors (hex), picked at random." },
    { name: "lineColor", type: "color", default: "#2f2f35", description: "Column line color." },
    { name: "gap", type: "number", min: 12, max: 120, step: 2, default: 40, description: "Distance between columns in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Fall speed multiplier." },
    { name: "frequency", type: "number", min: 0.2, max: 10, step: 0.2, default: 2, description: "New pulses per second per 10 columns." },
  ],
  usage: `<div className="relative h-96">
  <ColumnLines colors={["#a78bfa", "#f472b6", "#38bdf8"]} />
</div>`,
} satisfies Meta;
