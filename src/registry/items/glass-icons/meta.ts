import type { Meta } from "../../types";

export default {
  name: "Glass Icons",
  category: "components",
  description: "Icon tiles with a colored backplate behind a frosted glass front that lifts and tilts toward the pointer on hover.",
  props: [
    { name: "items", type: "node", description: "Array of { icon, label, color?, onClick? }." },
    { name: "size", type: "number", min: 40, max: 140, step: 2, default: 72, description: "Tile size in px." },
    { name: "tilt", type: "number", min: 0, max: 35, step: 1, default: 18, description: "Max pointer tilt of the glass in degrees." },
    { name: "showLabels", type: "boolean", default: true, description: "Show the label under a hovered tile." },
  ],
  usage: `<GlassIcons
  items={[
    { icon: <FileText />, label: "Files", color: "#3b82f6" },
    { icon: <Heart />, label: "Likes", color: "#f43f5e" },
  ]}
/>`,
} satisfies Meta;
