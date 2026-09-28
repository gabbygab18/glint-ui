import type { Meta } from "../../types";

export default {
  name: "Branched Menu",
  category: "micro-interactions",
  description: "A trigger that grows curved branches out to its sub-actions, then pulls them back in when it closes.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "radius", type: "number", min: 80, max: 200, step: 5, default: 130, description: "Branch length in px." },
    { name: "spread", type: "number", min: 60, max: 180, step: 5, default: 150, description: "Fan angle in degrees." },
    { name: "color", type: "color", default: "#a3e635", description: "Branch stroke color." },
    { name: "label", type: "string", default: "Create", description: "Accessible name of the trigger." },
    { name: "items", type: "node", description: "Array of { label, icon } sub-actions." },
    { name: "onSelect", type: "node", description: "Called with (item, index) when a sub-action is picked." },
  ],
  usage: `<BranchedMenu
  items={[
    { label: "Photo", icon: <Camera /> },
    { label: "Note", icon: <FileText /> },
    { label: "Voice", icon: <Mic /> },
  ]}
  onSelect={(item) => create(item.label)}
/>`,
} satisfies Meta;
