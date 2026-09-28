import type { Meta } from "../../types";

export default {
  name: "Cubes",
  category: "animations",
  description: "A field of 3D cubes that tilt toward the cursor and flip in a glowing ripple when clicked.",
  props: [
    { name: "grid", type: "number", min: 3, max: 14, step: 1, default: 8, description: "Cubes per row and column." },
    { name: "maxAngle", type: "number", min: 0, max: 90, step: 5, default: 45, description: "Max tilt in degrees." },
    { name: "radius", type: "number", min: 1, max: 8, step: 0.5, default: 3, description: "Radius of the cursor's influence, in cells." },
    { name: "gap", type: "number", min: 0, max: 24, step: 1, default: 8, description: "Gap between cubes in px." },
    { name: "rippleColor", type: "color", default: "#c6ff3d", description: "Color the cubes flash as a ripple passes." },
    { name: "rippleSpeed", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Ripple travel speed multiplier." },
    { name: "autoAnimate", type: "boolean", default: true, description: "Wander and ripple on their own while the pointer is away." },
  ],
  usage: `<Cubes grid={8} className="w-96" />`,
} satisfies Meta;
