import type { Meta } from "../../types";

export default {
  name: "Pixel Highlight",
  category: "animations",
  description: "Hovering or focusing fills the element with twinkling pixels that ripple out from the pointer, and ripple away on leave.",
  props: [
    { name: "children", type: "node", description: "Element to highlight." },
    { name: "colors", type: "list", default: ["#c6ff3d", "#86efac", "#22d3ee"], description: "Pixel colors." },
    { name: "gap", type: "number", min: 3, max: 24, step: 1, default: 7, description: "Px between pixel centers." },
    { name: "speed", type: "number", min: 100, max: 3000, step: 50, default: 900, description: "Ripple speed in px per second." },
    { name: "twinkle", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Twinkle strength while lit." },
  ],
  usage: `<PixelHighlight className="rounded-2xl border p-6">
  <h3>Hover me</h3>
</PixelHighlight>`,
} satisfies Meta;
