import type { Meta } from "../../types";

export default {
  name: "Expand Search",
  category: "components",
  description: "A round search button that stretches into a field on press, focuses itself, pops in a clear button as you type, and folds back on Escape or when it loses focus empty.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "width", type: "number", min: 160, max: 380, step: 10, default: 260, description: "Width in px when open." },
    { name: "placeholder", type: "string", default: "Search…", description: "Placeholder text." },
    { name: "align", type: "select", options: ["right", "left"], default: "right", description: "Which side stays put while it grows." },
    { name: "onSearch", type: "node", description: "(query) => void, called on Enter." },
    { name: "onChange", type: "node", description: "(query) => void, called on every keystroke." },
  ],
  usage: `<ExpandSearch onSearch={(q) => router.push(\`/search?q=\${q}\`)} />`,
} satisfies Meta;
