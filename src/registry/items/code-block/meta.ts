import type { Meta } from "../../types";

export default {
  name: "Code Block",
  category: "primitives",
  description: "Code display with a filename tab, line numbers, highlighted lines that sweep in, lightweight built-in token coloring and a copy button that springs into a check.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "filename", type: "string", default: "counter.tsx", description: "Tab label in the header." },
    { name: "language", type: "select", options: ["tsx", "ts", "js", "css", "json", "bash", "python"], default: "tsx", description: "Token rules and header badge." },
    { name: "highlightLines", type: "string", default: "5-6", description: "1-based lines to highlight: \"3\", \"2,5-7\" or number[]." },
    { name: "showLineNumbers", type: "boolean", default: true, description: "Gutter with line numbers." },
    { name: "copyable", type: "boolean", default: true, description: "Copy-to-clipboard button." },
    { name: "code", type: "node", description: "The source text to display." },
  ],
  usage: `<CodeBlock
  filename="counter.tsx"
  language="tsx"
  highlightLines="5-6"
  code={source}
/>`,
} satisfies Meta;
