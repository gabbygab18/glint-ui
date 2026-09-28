import type { Meta } from "../../types";

export default {
  name: "Halftone Reveal",
  category: "animations",
  description: "Renders an image as breathing halftone dots that swell and melt into the full photo around the cursor.",
  props: [
    { name: "src", type: "string", default: "https://picsum.photos/seed/glint-2/1400/900", description: "Image URL (CORS-enabled)." },
    { name: "alt", type: "string", default: "Halftone photo", description: "Accessible description of the image." },
    { name: "cellSize", type: "number", min: 5, max: 30, step: 1, default: 11, description: "Halftone cell size in px." },
    { name: "radius", type: "number", min: 40, max: 400, step: 10, default: 170, description: "Reveal radius around the cursor in px." },
    { name: "colored", type: "boolean", default: true, description: "Dots take the image colors." },
    { name: "dotColor", type: "color", default: "#c6ff3d", description: "Dot color when colored is off." },
  ],
  usage: `<HalftoneReveal src="/photo.jpg" alt="Harbor at dusk" className="h-96 w-full rounded-3xl" />`,
} satisfies Meta;
