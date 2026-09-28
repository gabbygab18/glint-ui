import type { Meta } from "../../types";

export default {
  name: "Swirl",
  category: "backgrounds",
  description: "A psychedelic paint swirl in two bold colors outlined with ink, with an optional chunky-pixel mode. WebGL.",
  props: [
    { name: "color1", type: "color", default: "#ff4b3e", description: "First paint color." },
    { name: "color2", type: "color", default: "#1f7ae0", description: "Second paint color." },
    { name: "color3", type: "color", default: "#0f1a24", description: "Ink color outlining the swirls." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Flow speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Zoom; higher means larger swirls." },
    { name: "twist", type: "number", min: -4, max: 4, step: 0.1, default: 1, description: "Spiral twist around the center." },
    { name: "pixelated", type: "boolean", default: false, description: "Render in chunky pixels." },
    { name: "pixelSize", type: "number", min: 2, max: 16, step: 1, default: 5, description: "Pixel size in px when pixelated." },
  ],
  usage: `<div className="relative h-96">
  <Swirl pixelated pixelSize={5} />
</div>`,
} satisfies Meta;
