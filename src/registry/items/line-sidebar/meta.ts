import type { Meta } from "../../types";

export default {
  name: "Line Sidebar",
  category: "components",
  description: "Sidebar navigation whose glowing line indicator stretches toward the new item and springs back to size.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { label, icon?, badge? }." },
    { name: "defaultActive", type: "number", min: 0, max: 6, step: 1, default: 0, description: "Index selected at first render." },
    { name: "color", type: "color", default: "#c6f24e", description: "Indicator color." },
    { name: "stiffness", type: "number", min: 80, max: 1000, step: 20, default: 420, description: "Spring stiffness of the leading edge." },
    { name: "showTrack", type: "boolean", default: true, description: "Show the faint rail behind the indicator." },
    { name: "onSelect", type: "node", description: "Called with the selected index." },
  ],
  usage: `<LineSidebar
  items={[
    { label: "Dashboard", icon: <LayoutGrid /> },
    { label: "Inbox", icon: <Inbox />, badge: "12" },
  ]}
/>`,
} satisfies Meta;
