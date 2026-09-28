import type { Meta } from "../../types";

export default {
  name: "Galaxy",
  category: "backgrounds",
  description: "A slowly spinning spiral galaxy of twinkling stars and glowing dust, with depth parallax under the cursor.",
  props: [
    { name: "hue", type: "number", min: 0, max: 360, step: 1, default: 225, description: "Hue of the arms in degrees; the core takes the warm opposite." },
    { name: "density", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Star density multiplier." },
    { name: "arms", type: "number", min: 1, max: 6, step: 1, default: 2, description: "Number of spiral arms." },
    { name: "speed", type: "number", min: 0, max: 5, step: 0.1, default: 1, description: "Rotation and twinkle speed." },
    { name: "twinkle", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Twinkle amount." },
    { name: "scale", type: "number", min: 0.4, max: 2.5, step: 0.05, default: 1, description: "Zoom." },
    { name: "parallax", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Cursor parallax strength." },
  ],
  usage: `<div className="relative h-96 bg-black">
  <Galaxy hue={225} arms={2} />
</div>`,
} satisfies Meta;
