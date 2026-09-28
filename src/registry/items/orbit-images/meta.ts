import type { Meta } from "../../types";

export default {
  name: "Orbit Images",
  category: "animations",
  description: "Photos circle a tilted ellipse in pseudo-3D, scaling and dimming with depth, and glide to a stop on hover.",
  props: [
    { name: "images", type: "list", control: false, description: "Image URLs placed evenly around the orbit." },
    { name: "children", type: "node", description: "Content in the middle of the orbit." },
    { name: "radius", type: "number", min: 80, max: 600, step: 10, default: 320, description: "Horizontal orbit radius in px." },
    { name: "tilt", type: "number", min: 0, max: 89, step: 1, default: 64, description: "Orbit plane tilt in degrees." },
    { name: "duration", type: "number", min: -60, max: 60, step: 1, default: 28, description: "Seconds per revolution; negative reverses." },
    { name: "size", type: "number", min: 40, max: 260, step: 5, default: 110, description: "Image width in px." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Ease to a stop while hovered." },
  ],
  usage: `<OrbitImages images={photos} className="h-96 w-full">
  <h2>Our community</h2>
</OrbitImages>`,
} satisfies Meta;
