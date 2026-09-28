import type { Meta } from "../../types";

export default {
  name: "Warp Text",
  category: "text-animations",
  description: "Type that ripples like heat haze through an SVG turbulence filter on hover, with an optional RGB fringe, then eases back to crisp.",
  props: [
    { name: "text", type: "string", default: "Warp", description: "Text to warp." },
    { name: "strength", type: "number", min: 0, max: 80, step: 1, default: 24, description: "Peak displacement in px." },
    { name: "frequency", type: "number", min: 0.002, max: 0.05, step: 0.001, default: 0.008, description: "Noise scale; lower is broader waves." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Speed of the flowing distortion." },
    { name: "chromatic", type: "boolean", default: true, description: "Split RGB channels for a colored fringe." },
    { name: "trigger", type: "select", options: ["hover", "always"], default: "hover", description: "Warp on hover or keep a gentle warp running." },
    { name: "as", type: "select", options: ["p", "h1", "h2", "h3", "span", "div"], default: "p", description: "Element to render.", control: false },
  ],
  usage: `<WarpText text="Warp" strength={28} className="text-8xl font-black" />`,
} satisfies Meta;
