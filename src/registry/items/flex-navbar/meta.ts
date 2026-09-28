import type { Meta } from "../../types";

export default {
  name: "Flex Navbar",
  category: "components",
  description: "Icon navbar whose items spring open to reveal a tinted label on hover or focus while their neighbours flex aside.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { label, icon, color?, onClick? }." },
    { name: "accent", type: "color", default: "#a78bfa", description: "Accent for items without their own color." },
    { name: "showActiveLabel", type: "boolean", default: true, description: "Keep the active item open when nothing is hovered." },
    { name: "bounce", type: "number", min: 0, max: 0.6, step: 0.05, default: 0.35, description: "Spring bounce." },
    { name: "iconSize", type: "number", min: 14, max: 32, step: 1, default: 20, description: "Icon size in px." },
    { name: "defaultActive", type: "number", min: 0, max: 4, step: 1, default: 0, control: false, description: "Index of the initially active item." },
    { name: "onChange", type: "node", description: "Called with the new active index." },
  ],
  usage: `<FlexNavbar
  items={[
    { label: "Home", icon: <House />, color: "#a78bfa" },
    { label: "Explore", icon: <Compass />, color: "#22d3ee" },
    { label: "Profile", icon: <User />, color: "#f472b6" },
  ]}
/>`,
} satisfies Meta;
