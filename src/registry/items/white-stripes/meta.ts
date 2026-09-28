import type { Meta } from "../../types";

export default {
  name: "White Stripes",
  category: "backgrounds",
  description: "Layers of satin-shaded diagonal stripes drift at different speeds, casting soft shadows with cursor parallax. WebGL.",
  props: [
    { name: "color", type: "color", default: "#ffffff", description: "Stripe color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Drift speed multiplier." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Stripe density." },
    { name: "angle", type: "number", min: -90, max: 90, step: 1, default: 35, description: "Stripe angle in degrees." },
    { name: "opacity", type: "number", min: 0.1, max: 1, step: 0.05, default: 0.85, description: "Overall opacity." },
    { name: "parallax", type: "boolean", default: true, description: "Layers shift with the cursor." },
  ],
  usage: `<div className="relative h-96">
  <WhiteStripes angle={35} />
</div>`,
} satisfies Meta;
