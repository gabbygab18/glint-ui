import type { Meta } from "../../types";

export default {
  name: "Reorder List",
  category: "components",
  description: "A list you drag into a new order by its handles: the picked-up row lifts with a shadow while the others spring aside. Handles also move rows with the arrow keys, announced to screen readers.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Reorderable list", description: "Accessible name of the list." },
    { name: "items", type: "node", description: "Controlled order: { id, label, description?, leading? }[]." },
    { name: "defaultItems", type: "node", description: "Initial order when uncontrolled." },
    { name: "onChange", type: "node", description: "(items) => void, called with the new order." },
  ],
  usage: `<ReorderList items={tasks} onChange={setTasks} label="Priorities" />`,
} satisfies Meta;
