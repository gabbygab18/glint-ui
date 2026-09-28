import type { Meta } from "../../types";

export default {
  name: "Ghost Fibers",
  category: "backgrounds",
  description: "Translucent glowing fibers that braid, drift apart and fade in and out like ghostly silk.",
  props: [
    { name: "colors", type: "list", default: ["#8be9fd", "#b69cff", "#ff9ad5"], description: "One color per bundle (up to three)." },
    { name: "fibers", type: "number", min: 1, max: 24, step: 1, default: 9, description: "Fibers per bundle." },
    { name: "glow", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Halo strength." },
    { name: "spread", type: "number", min: 0.2, max: 2.5, step: 0.05, default: 1, description: "How far fibers drift apart." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed." },
  ],
  usage: `<div className="relative h-96 bg-black">
  <GhostFibers fibers={9} />
</div>`,
} satisfies Meta;
