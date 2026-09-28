import type { Meta } from "../../types";

export default {
  name: "Shredder",
  category: "micro-interactions",
  description: "Delete a document card and it feeds into a rattling shredder, coming out as strips that scatter and fall, with an undo that drops it back in.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "title", type: "string", default: "Q3-forecast.pdf", description: "Document name." },
    { name: "subtitle", type: "string", default: "2.4 MB · edited 3h ago", description: "Line under the title." },
    { name: "strips", type: "number", min: 4, max: 24, step: 1, default: 12, description: "Number of strips." },
    { name: "undoTimeout", type: "number", min: 0, max: 15000, step: 500, default: 5000, description: "Ms undo stays available; 0 keeps it forever." },
    { name: "children", type: "node", description: "Custom card body." },
    { name: "onDelete", type: "node", description: "Called when the card is shredded." },
    { name: "onUndo", type: "node", description: "Called when undo restores it." },
    { name: "onExpire", type: "node", description: "Called when the undo window closes: delete for real here." },
  ],
  usage: `<Shredder
  title={file.name}
  onDelete={() => hide(file.id)}
  onUndo={() => show(file.id)}
  onExpire={() => deleteForever(file.id)}
/>`,
} satisfies Meta;
