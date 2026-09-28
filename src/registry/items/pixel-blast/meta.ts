import type { Meta } from "../../types";

export default {
  name: "Pixel Blast",
  category: "backgrounds",
  description: "A dithered field of tiny pixels that breathes with noise and bursts into shockwave rings on click. WebGL.",
  props: [
    { name: "color", type: "color", default: "#a78bfa", description: "Pixel color." },
    { name: "shape", type: "select", options: ["square", "circle"], default: "square", description: "Pixel shape." },
    { name: "pixelSize", type: "number", min: 2, max: 24, step: 1, default: 6, description: "Cell size in px." },
    { name: "density", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "How much of the field is lit." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "interactive", type: "boolean", default: true, description: "Blast rings on click." },
    { name: "autoBlast", type: "boolean", default: true, description: "Fire a blast at a random spot every few seconds." },
  ],
  usage: `<div className="relative h-96">
  <PixelBlast color="#a78bfa" shape="square" />
</div>`,
} satisfies Meta;
