import type { Meta } from "../../types";

export default {
  name: "Dither Veil",
  category: "animations",
  description: "A flowing 1-bit ordered-dither veil that dissolves around the cursor to reveal what is underneath.",
  props: [
    { name: "children", type: "node", description: "Content hidden under the veil." },
    { name: "pixelSize", type: "number", min: 2, max: 12, step: 1, default: 4, description: "Size of one dither pixel in px." },
    { name: "color", type: "color", default: "#0d0d0f", description: "Veil base color." },
    { name: "accent", type: "color", default: "#c6ff3d", description: "Dithered highlight color." },
    { name: "density", type: "number", min: 0, max: 1, step: 0.05, default: 0.4, description: "How much of the veil is highlight." },
    { name: "radius", type: "number", min: 30, max: 400, step: 10, default: 150, description: "Px radius the cursor dissolves." },
    { name: "heal", type: "number", min: 100, max: 5000, step: 100, default: 1400, description: "Ms for a revealed patch to close again." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed of the veil pattern." },
  ],
  usage: `<DitherVeil className="h-96 rounded-2xl">
  <img src="/secret.jpg" alt="" className="size-full object-cover" />
</DitherVeil>`,
} satisfies Meta;
