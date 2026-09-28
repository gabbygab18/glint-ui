import type { Meta } from "../../types";

export default {
  name: "Text Spotlight",
  category: "text-animations",
  description: "Dimmed text with a soft, gradient-lit spotlight that trails your cursor and drifts on its own when idle.",
  props: [
    {
      name: "text",
      type: "string",
      default: "Great interfaces are felt before they are understood. Move closer and the words light up.",
      description: "Text to render.",
    },
    { name: "radius", type: "number", min: 40, max: 500, step: 10, default: 180, description: "Spotlight radius, in px." },
    { name: "dim", type: "number", min: 0, max: 1, step: 0.01, default: 0.14, description: "Opacity of the unlit text, 0–1." },
    { name: "from", type: "color", default: "#a3e635", description: "Lit gradient start color." },
    { name: "to", type: "color", default: "#22d3ee", description: "Lit gradient end color." },
    { name: "smoothing", type: "number", min: 0, max: 0.98, step: 0.01, default: 0.85, description: "Follow lag, 0 = instant, closer to 1 = floatier." },
    { name: "autoPlay", type: "boolean", default: true, description: "Drift the light on its own while the pointer is away." },
  ],
  usage: `<TextSpotlight text="Great interfaces are felt before they are understood." radius={180} />`,
} satisfies Meta;
