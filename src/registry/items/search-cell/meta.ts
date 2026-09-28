import type { Meta } from "../../types";

export default {
  name: "Search Cell",
  category: "components",
  description: "A command-style search field that widens on focus and unfolds grouped, ranked results with highlighted matches, a sliding selection and full keyboard navigation.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "placeholder", type: "string", default: "Search or jump to…", description: "Input placeholder, also its accessible name." },
    { name: "maxResults", type: "number", min: 3, max: 12, step: 1, default: 7, description: "Max rows shown." },
    { name: "expand", type: "boolean", default: true, description: "Grow wider while open." },
    { name: "emptyMessage", type: "string", default: "No results for", description: "Prefix of the empty state, followed by the query." },
    { name: "items", type: "node", description: "`{ id, label, description?, group?, icon?, keywords?, shortcut? }[]`." },
    { name: "onSelect", type: "node", description: "`(item) => void`, on click or Enter." },
    { name: "defaultOpen", type: "node", description: "Start open without taking focus. Default false." },
  ],
  usage: `<SearchCell
  items={[
    { id: "dash", label: "Dashboard", group: "Pages", icon: <LayoutGrid /> },
    { id: "new", label: "New project", group: "Actions", shortcut: ["⌘", "N"] },
  ]}
  onSelect={(item) => router.push("/" + item.id)}
/>`,
} satisfies Meta;
