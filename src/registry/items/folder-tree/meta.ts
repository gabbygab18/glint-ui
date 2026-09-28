import type { Meta } from "../../types";

export default {
  name: "Folder Tree",
  category: "components",
  description: "File explorer tree with springy expand/collapse, a highlight that glides to the selected row, file-type icons and full keyboard navigation.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "data", type: "node", description: "Array of { id, name, children?, icon? }; nodes with children are folders." },
    { name: "indent", type: "number", min: 8, max: 32, step: 1, default: 16, description: "Px of indent per level." },
    { name: "showLines", type: "boolean", default: true, description: "Draw nesting guide lines." },
    { name: "folderColor", type: "color", default: "#7dd3fc", description: "Folder icon tint." },
    { name: "defaultExpanded", type: "list", control: false, description: "Folder ids open at first render." },
    { name: "defaultSelected", type: "string", control: false, description: "Node id selected at first render." },
    { name: "label", type: "string", control: false, description: "Accessible name for the tree." },
    { name: "onSelect", type: "node", description: "Called with (node, path) when a row is picked." },
  ],
  usage: `<FolderTree
  data={[
    { id: "src", name: "src", children: [{ id: "page", name: "page.tsx" }] },
    { id: "readme", name: "README.md" },
  ]}
  defaultExpanded={["src"]}
  onSelect={(node) => open(node.id)}
/>`,
} satisfies Meta;
