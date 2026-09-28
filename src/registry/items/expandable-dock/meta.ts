import type { Meta } from "../../types";

export default {
  name: "Expandable Dock",
  category: "components",
  description: "A compact pill of actions that springs open into a panel (search, quick actions, inbox, player), morphing its size and corners between states.",
  dependencies: ["motion", "react-use-measure"],
  props: [
    { name: "items", type: "node", description: "Array of { id, label, icon, panel?, onClick? }. Items with a panel expand the dock." },
    { name: "bounce", type: "number", min: 0, max: 0.5, step: 0.05, default: 0.2, description: "Spring bounce of the morph." },
    { name: "duration", type: "number", min: 0.2, max: 1.2, step: 0.05, default: 0.5, description: "Morph duration in seconds." },
    { name: "radius", type: "number", min: 8, max: 40, step: 1, default: 24, description: "Corner radius of the open panel in px." },
    { name: "defaultOpen", type: "string", control: false, description: "Id of the item open at first render." },
    { name: "onOpenChange", type: "node", description: "Called with the open item id, or null when closed." },
  ],
  usage: `<ExpandableDock
  items={[
    { id: "home", label: "Home", icon: <House /> },
    { id: "search", label: "Search", icon: <Search />, panel: <SearchPanel /> },
    { id: "inbox", label: "Inbox", icon: <Bell />, panel: <Inbox /> },
  ]}
/>`,
} satisfies Meta;
