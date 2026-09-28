import type { Meta } from "../../types";

export default {
  name: "Spark Waves",
  category: "backgrounds",
  description: "Glowing sine waves braid across the stage and shed drifting sparks from their crests. Canvas 2D.",
  props: [
    { name: "colors", type: "list", default: ["#22d3ee", "#a78bfa", "#f472b6"], description: "One color per wave." },
    { name: "waves", type: "number", min: 1, max: 6, step: 1, default: 3, description: "Number of waves." },
    { name: "amplitude", type: "number", min: 10, max: 200, step: 5, default: 70, description: "Wave height in px." },
    { name: "speed", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "sparkRate", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "How eagerly the crests shed sparks." },
    { name: "lineWidth", type: "number", min: 0.5, max: 5, step: 0.1, default: 1.5, description: "Core line width in px." },
  ],
  usage: `<div className="relative h-96">
  <SparkWaves colors={["#22d3ee", "#a78bfa", "#f472b6"]} />
</div>`,
} satisfies Meta;
