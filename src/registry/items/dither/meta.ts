import type { Meta } from "../../types";

export default {
  name: "Dither",
  category: "backgrounds",
  description: "Flowing waves rendered with 8x8 ordered Bayer dithering in two colors; the cursor sends ripples through them. WebGL.",
  props: [
    { name: "color", type: "color", default: "#c6ff3d", description: "Ink color of the lit dots." },
    { name: "background", type: "color", default: "#0a0a0c", description: "Background color between the dots." },
    { name: "pixelSize", type: "number", min: 1, max: 10, step: 1, default: 3, description: "Size of one dither pixel in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Wave speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Zoom; higher means broader waves." },
    { name: "interactive", type: "boolean", default: true, description: "Cursor sends ripples through the waves." },
  ],
  usage: `<div className="relative h-96">
  <Dither color="#c6ff3d" pixelSize={3} />
</div>`,
} satisfies Meta;
