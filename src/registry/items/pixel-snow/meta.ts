import type { Meta } from "../../types";

export default {
  name: "Pixel Snow",
  category: "backgrounds",
  description: "Chunky pixel-art snowflakes drifting down in parallax layers, swaying in the wind. WebGL.",
  props: [
    { name: "color", type: "color", default: "#ffffff", description: "Flake color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Fall speed multiplier." },
    { name: "density", type: "number", min: 0.05, max: 1, step: 0.05, default: 0.35, description: "How many flakes." },
    { name: "pixelSize", type: "number", min: 2, max: 10, step: 1, default: 4, description: "Size of one chunky pixel in px." },
    { name: "wind", type: "number", min: -2, max: 2, step: 0.1, default: 0.3, description: "Sideways drift; negative blows left." },
  ],
  usage: `<div className="relative h-96">
  <PixelSnow density={0.35} pixelSize={4} />
</div>`,
} satisfies Meta;
