import type { Meta } from "../../types";

export default {
  name: "Image Trail",
  category: "animations",
  description: "Photos pop in along the cursor path, then drift, shrink and fade away.",
  props: [
    { name: "images", type: "list", control: false, description: "Image URLs, spawned in order." },
    { name: "children", type: "node", description: "Content shown above the trail area." },
    { name: "threshold", type: "number", min: 20, max: 200, step: 5, default: 60, description: "Px of cursor travel between spawns." },
    { name: "size", type: "number", min: 60, max: 320, step: 10, default: 150, description: "Image width in px." },
    { name: "duration", type: "number", min: 300, max: 3000, step: 100, default: 1100, description: "Lifetime of each image in ms." },
    { name: "rotation", type: "number", min: 0, max: 45, step: 1, default: 10, description: "Max random tilt in degrees." },
  ],
  usage: `<ImageTrail images={["/a.jpg", "/b.jpg", "/c.jpg"]} className="h-96 w-full" />`,
} satisfies Meta;
