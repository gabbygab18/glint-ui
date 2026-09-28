import type { Meta } from "../../types";

export default {
  name: "Gradient Blinds",
  category: "backgrounds",
  description: "Venetian-blind strips refracting a drifting gradient, lit by a spotlight that follows the cursor.",
  props: [
    { name: "colors", type: "list", default: ["#12092e", "#6d28d9", "#ec4899", "#fdba74"], description: "Gradient colors (up to four)." },
    { name: "stripes", type: "number", min: 2, max: 60, step: 1, default: 16, description: "Strips across the width." },
    { name: "angle", type: "number", min: -90, max: 90, step: 1, default: 0, description: "Strip angle in degrees." },
    { name: "distortion", type: "number", min: 0, max: 3, step: 0.05, default: 1, description: "How much each strip refracts the gradient." },
    { name: "spotlightColor", type: "color", default: "#ffffff", description: "Spotlight color." },
    { name: "spotlightRadius", type: "number", min: 0.1, max: 1.5, step: 0.05, default: 0.45, description: "Spotlight radius (fraction of height)." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Gradient drift speed." },
  ],
  usage: `<div className="relative h-96">
  <GradientBlinds stripes={16} angle={0} />
</div>`,
} satisfies Meta;
