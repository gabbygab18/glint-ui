import type { Meta } from "../../types";

export default {
  name: "CRT Warp",
  category: "backgrounds",
  description: "A glowing gradient seen through an old CRT: barrel curvature, scanlines, RGB mask, flicker and a rolling bar. WebGL.",
  props: [
    {
      name: "colors",
      type: "list",
      default: ["#1a0b3d", "#ff2e88", "#ffb347"],
      description: "Three gradient colors, bottom to top.",
    },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Gradient drift speed multiplier." },
    { name: "curvature", type: "number", min: 0, max: 1.5, step: 0.05, default: 0.5, description: "Barrel curvature of the tube." },
    { name: "scanlines", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Scanline darkness." },
    { name: "mask", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "RGB aperture mask strength." },
    { name: "flicker", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Flicker and rolling bar strength." },
  ],
  usage: `<div className="relative h-96">
  <CrtWarp curvature={0.5} />
</div>`,
} satisfies Meta;
