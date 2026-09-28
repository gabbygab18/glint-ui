import type { Meta } from "../../types";

export default {
  name: "Arc Sidebar",
  category: "widgets",
  description: "A sectioned nav whose active marker arcs between rows, shoves the label aside on landing and crossfades into each section's ink. Works as a static rail or a drawer.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "marker", type: "select", options: ["dot", "pip", "bar", "glow"], default: "dot", description: "Marker shape." },
    { name: "fade", type: "boolean", default: true, description: "Fade the list at both edges (adds 3rem of padding with it)." },
    { name: "navLabel", type: "string", default: "Sidebar", description: "Accessible name of the nav, and the drawer's title." },
    { name: "sections", type: "node", description: "`{ label?, color?, items: { label, href?, icon?, badge?, disabled? }[] }[]`." },
    { name: "markerColor", type: "string", default: "var(--primary, #b4e84c)", control: false, description: "Marker colour, and the fallback for sections without `color`." },
    { name: "activeHref", type: "string", control: false, description: "Mark the row whose `href` matches (route-driven)." },
    { name: "value", type: "number", min: 0, max: 50, control: false, description: "Active row as a flat index (controlled)." },
    { name: "defaultValue", type: "number", min: 0, max: 50, default: 0, control: false, description: "Active row on mount when uncontrolled." },
    { name: "onChange", type: "node", description: "`(index, item) => void`, fired on selection." },
    { name: "onNavigate", type: "node", description: "`(item) => void`, fired on every selection." },
    { name: "header", type: "node", description: "Pinned above the list." },
    { name: "footer", type: "node", description: "Pinned below the list." },
    { name: "variant", type: "select", options: ["rail", "drawer"], default: "rail", control: false, description: "Static panel or sliding overlay." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "Drawer only: cover the viewport (and lock scroll) or the nearest positioned ancestor." },
    { name: "open", type: "boolean", default: false, control: false, description: "Drawer only: whether it is showing." },
    { name: "onOpenChange", type: "node", description: "Drawer only: `(open) => void` on Escape, scrim or close button." },
  ],
  usage: `<ArcSidebar
  sections={[
    { label: "Getting started", items: [{ label: "Overview" }, { label: "Install" }] },
    { label: "Foundations", color: "#7aa2ff", items: [{ label: "Colour" }, { label: "Spacing" }] },
  ]}
  marker="pip"
/>`,
} satisfies Meta;
