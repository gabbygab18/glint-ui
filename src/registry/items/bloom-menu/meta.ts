import type { Meta } from "../../types";

export default {
  name: "Bloom Menu",
  category: "components",
  description: "A button that blooms into its own menu: the pill stretches into a panel in place, the label fades into the actions, and it folds back when you pick one. Arrow keys, Home/End and Escape work.",
  dependencies: ["motion", "react-use-measure"],
  isNew: true,
  props: [
    { name: "bounce", type: "number", min: 0, max: 0.5, step: 0.02, default: 0.2, description: "Spring bounce of the morph." },
    { name: "duration", type: "number", min: 0.2, max: 1, step: 0.02, default: 0.42, description: "Morph length in seconds." },
    { name: "align", type: "select", options: ["left", "right"], default: "left", description: "Which edge the menu grows from." },
    { name: "items", type: "node", description: "Array of { label, icon?, hint?, destructive?, onSelect? }." },
  ],
  usage: `<BloomMenu
  label="New"
  icon={<Plus />}
  items={[
    { label: "New file", icon: <FilePlus2 />, onSelect: createFile },
    { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: remove },
  ]}
/>`,
} satisfies Meta;
