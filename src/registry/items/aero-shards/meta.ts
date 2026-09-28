import type { Meta } from "../../types";

export default {
  name: "Aero Shards",
  category: "backgrounds",
  description: "Translucent glass shards drift in layers over soft glowing color, bending the light with refraction, dispersion and slow cursor parallax. WebGL.",
  props: [
    {
      name: "colors",
      type: "list",
      default: ["#38bdf8", "#a78bfa", "#f0abfc"],
      description: "Three glow colors behind the glass.",
    },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "scale", type: "number", min: 0.4, max: 2.5, step: 0.05, default: 1, description: "Shard size multiplier." },
    { name: "density", type: "number", min: 0, max: 1, step: 0.05, default: 0.55, description: "Share of grid cells holding a shard." },
    { name: "refraction", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Strength of the refraction." },
  ],
  usage: `<div className="relative h-96">
  <AeroShards density={0.55} />
</div>`,
} satisfies Meta;
