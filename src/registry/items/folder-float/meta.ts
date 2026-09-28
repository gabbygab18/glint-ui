import type { Meta } from "../../types";

export default {
  name: "Folder Float",
  category: "micro-interactions",
  description: "A folder whose flap tips open on hover or focus so its files float up and fan out, then settle back in; click pins it open.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Design", description: "Folder name." },
    { name: "files", type: "list", default: ["brief.pdf", "moodboard.png", "logo.svg", "notes.md"], description: "File names (first four are drawn); the badge shows the total." },
    { name: "color", type: "color", default: "#60a5fa", description: "Folder color." },
    { name: "defaultOpen", type: "boolean", default: false, description: "Start pinned open." },
    { name: "open", type: "node", description: "Controlled pinned-open state. Pair with onOpenChange." },
    { name: "onOpenChange", type: "node", description: "Called when a click or Enter pins / unpins the folder." },
  ],
  usage: `<FolderFloat label="Design" files={["brief.pdf", "logo.svg"]} onOpenChange={setOpen} />`,
} satisfies Meta;
