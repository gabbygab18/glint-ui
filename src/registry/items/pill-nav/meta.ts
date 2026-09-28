import type { Meta } from "../../types";

export default {
  name: "Pill Nav",
  category: "components",
  description: "Pill navigation whose items flood with a rising circle of color on hover, with a sliding active dot and a compact menu on narrow containers.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { label, href }." },
    { name: "logo", type: "node", description: "Brand mark shown at the left." },
    { name: "fillColor", type: "color", default: "#c6ff3d", description: "Color of the circle that floods a pill on hover." },
    { name: "fillTextColor", type: "color", default: "#0a0a0a", description: "Label color on top of the fill." },
    { name: "duration", type: "number", min: 0.1, max: 1.5, step: 0.05, default: 0.5, description: "Fill duration in seconds." },
    { name: "defaultActiveIndex", type: "number", min: 0, max: 4, step: 1, default: 0, control: false, description: "Initially active item when uncontrolled." },
    { name: "activeIndex", type: "node", description: "Controlled active index." },
    { name: "onItemClick", type: "node", description: "(item, index) => void" },
  ],
  usage: `<PillNav
  logo={<span>nº</span>}
  items={[
    { label: "Home", href: "/" },
    { label: "Work", href: "/work" },
    { label: "Contact", href: "/contact" },
  ]}
/>`,
} satisfies Meta;
