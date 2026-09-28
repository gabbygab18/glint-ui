import type { Meta } from "../../types";

export default {
  name: "Floating Lines",
  category: "backgrounds",
  description: "Three depth layers of thin glowing wave lines drifting with parallax and parting around the cursor.",
  props: [
    { name: "colors", type: "list", default: ["#a78bfa", "#22d3ee", "#c6ff3d"], description: "Up to three colors blended across each ribbon." },
    { name: "lineCount", type: "number", min: 2, max: 40, step: 1, default: 14, description: "Lines per layer." },
    { name: "lineWidth", type: "number", min: 0.4, max: 4, step: 0.1, default: 1.2, description: "Line width in px." },
    { name: "amplitude", type: "number", min: 0, max: 2.5, step: 0.05, default: 1, description: "Wave height." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed." },
    { name: "bend", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "How strongly lines part around the cursor." },
    { name: "parallax", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Layer shift with the cursor." },
  ],
  usage: `<div className="relative h-96 bg-black">
  <FloatingLines colors={["#a78bfa", "#22d3ee", "#c6ff3d"]} />
</div>`,
} satisfies Meta;
