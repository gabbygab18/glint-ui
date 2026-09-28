import type { Meta } from "../../types";

export default {
  name: "Prompt Bar",
  category: "micro-interactions",
  description: "AI prompt input that grows with your text, holds springy attachment chips, and morphs its send arrow into a stop button ringed by a spinner while generating.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "placeholder", type: "string", default: "Ask anything…", description: "Placeholder text." },
    { name: "maxRows", type: "number", min: 2, max: 12, step: 1, default: 6, description: "Lines the field grows to before it scrolls." },
    { name: "generating", type: "boolean", default: false, description: "Force the generating state." },
    { name: "onSubmit", type: "node", description: "(text, files) => void | Promise. A returned promise shows the generating state until it settles." },
    { name: "onStop", type: "node", description: "Called when stop is pressed while generating." },
    { name: "defaultFiles", type: "node", description: "Files attached on mount." },
  ],
  usage: `<PromptBar
  onSubmit={(text, files) => streamAnswer(text, files)}
  onStop={() => controller.abort()}
/>`,
} satisfies Meta;
