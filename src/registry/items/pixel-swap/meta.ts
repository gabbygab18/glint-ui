import type { Meta } from "../../types";

export default {
  name: "Pixel Swap",
  category: "animations",
  description: "On hover or focus, an image dissolves into a second one through a wave of pixel blocks spreading from the pointer.",
  props: [
    { name: "src", type: "string", control: false, description: "Image shown at rest (CORS-enabled)." },
    { name: "hoverSrc", type: "string", control: false, description: "Image revealed on hover." },
    { name: "alt", type: "string", control: false, description: "Accessible description." },
    { name: "blockSize", type: "number", min: 6, max: 60, step: 1, default: 18, description: "Pixel block size in px." },
    { name: "duration", type: "number", min: 150, max: 2500, step: 50, default: 700, description: "Transition length in ms." },
    { name: "accent", type: "color", default: "#c6ff3d", description: "Color of the dissolve's leading edge." },
  ],
  usage: `<PixelSwap src="/before.jpg" hoverSrc="/after.jpg" alt="Product shot" className="h-96 w-72 rounded-2xl" />`,
} satisfies Meta;
