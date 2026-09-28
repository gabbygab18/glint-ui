import type { Meta } from "../../types";

export default {
  name: "Drift Wall",
  category: "components",
  description: "A tilted wall of image columns drifting up and down at different speeds, pausing on hover.",
  props: [
    { name: "images", type: "node", description: "Array of image URLs." },
    { name: "columns", type: "number", min: 2, max: 9, step: 1, default: 7, description: "Number of image columns." },
    { name: "speed", type: "number", min: 0, max: 150, step: 5, default: 40, description: "Drift speed in px per second." },
    { name: "tilt", type: "number", min: 0, max: 30, step: 1, default: 16, description: "Wall tilt in degrees." },
    { name: "gap", type: "number", min: 0, max: 40, step: 2, default: 16, description: "Px between tiles." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Freeze the wall and spotlight a tile on hover." },
    { name: "fade", type: "boolean", default: true, description: "Fade the wall into the background at the edges." },
  ],
  usage: `<div className="relative h-[32rem]">
  <DriftWall images={photos} columns={7} speed={40} />
</div>`,
} satisfies Meta;
