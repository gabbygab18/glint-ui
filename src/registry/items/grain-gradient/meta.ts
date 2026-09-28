import type { Meta } from "../../types";

export default {
  name: "Grain Gradient",
  category: "backgrounds",
  description: "A slowly morphing mesh gradient of four colors under a layer of moving film grain.",
  props: [
    { name: "colors", type: "list", default: ["#ff6a3d", "#c026d3", "#4338ca", "#0c0a1f"], description: "Three or four mesh colors." },
    { name: "speed", type: "number", min: 0, max: 5, step: 0.1, default: 1, description: "Morph speed." },
    { name: "grain", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Film grain strength." },
    { name: "warp", type: "number", min: 0, max: 3, step: 0.05, default: 1, description: "How much the colors swirl." },
  ],
  usage: `<div className="relative h-96">
  <GrainGradient grain={0.5} />
</div>`,
} satisfies Meta;
