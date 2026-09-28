import type { Meta } from "../../types";

export default {
  name: "Iridescence",
  category: "backgrounds",
  description: "An oil-slick film of flowing interference colors that swirls around the cursor.",
  props: [
    { name: "tint", type: "color", default: "#ffffff", description: "Multiplies the film colors." },
    { name: "speed", type: "number", min: 0, max: 5, step: 0.1, default: 1, description: "Flow speed." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.05, default: 1, description: "Pattern zoom." },
    { name: "coverage", type: "number", min: 0, max: 1, step: 0.05, default: 0.5, description: "Colored film vs. dark oil." },
    { name: "mouseStrength", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Cursor swirl strength." },
  ],
  usage: `<div className="relative h-96">
  <Iridescence coverage={0.5} />
</div>`,
} satisfies Meta;
