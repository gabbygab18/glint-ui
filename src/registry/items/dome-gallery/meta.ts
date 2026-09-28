import type { Meta } from "../../types";

export default {
  name: "Dome Gallery",
  category: "components",
  description: "Photos tiled across the inside of a sphere that you drag to look around, with inertia and click-to-enlarge.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "images", type: "node", description: "Array of image URLs (repeated across the dome)." },
    { name: "radius", type: "number", min: 300, max: 1000, step: 10, default: 560, description: "Sphere radius in px." },
    { name: "columns", type: "number", min: 12, max: 36, step: 1, default: 22, description: "Tiles around the circle." },
    { name: "rows", type: "number", min: 1, max: 9, step: 1, default: 5, description: "Rows of tiles." },
    { name: "gap", type: "number", min: 0, max: 0.4, step: 0.01, default: 0.1, description: "Space between tiles (fraction of size)." },
    { name: "autoRotate", type: "number", min: 0, max: 30, step: 1, default: 4, description: "Idle rotation in deg/s." },
    { name: "dragSensitivity", type: "number", min: 0.05, max: 0.6, step: 0.01, default: 0.18, description: "Degrees per px dragged." },
    { name: "maxPitch", type: "number", min: 0, max: 60, step: 1, default: 22, description: "Max up/down tilt in degrees." },
    { name: "tileRadius", type: "number", min: 0, max: 40, step: 1, default: 14, description: "Tile corner radius in px." },
  ],
  usage: `<div style={{ height: 600 }}>
  <DomeGallery images={["/1.jpg", "/2.jpg", "/3.jpg"]} />
</div>`,
} satisfies Meta;
