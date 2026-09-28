import type { Meta } from "../../types";

export default {
  name: "Staggered Menu",
  category: "components",
  description: "Menu button that sweeps staggered colored layers across the screen before a panel of oversized links rises into place.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { label, href }." },
    { name: "socials", type: "node", description: "Small links at the bottom of the panel." },
    { name: "logo", type: "node", description: "Brand shown at the top left." },
    { name: "layerColors", type: "list", default: ["#c6ff3d", "#5b3df5"], description: "Colors of the layers that sweep in before the panel." },
    { name: "accentColor", type: "color", default: "#5b3df5", description: "Numbers, hover and icon color." },
    { name: "side", type: "select", options: ["right", "left"], default: "right", description: "Edge the panel slides in from." },
    { name: "numbered", type: "boolean", default: true, description: "Show 01, 02… next to each link." },
    { name: "stagger", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.08, description: "Seconds between each layer and link." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "`absolute` renders inside the nearest positioned parent." },
    { name: "defaultOpen", type: "boolean", default: false, control: false, description: "Start open." },
    { name: "onOpenChange", type: "node", description: "(open: boolean) => void" },
  ],
  usage: `<StaggeredMenu
  logo={<span>forma.</span>}
  items={[
    { label: "Work", href: "/work" },
    { label: "Studio", href: "/studio" },
    { label: "Contact", href: "/contact" },
  ]}
  socials={[{ label: "Instagram", href: "https://instagram.com" }]}
/>`,
} satisfies Meta;
