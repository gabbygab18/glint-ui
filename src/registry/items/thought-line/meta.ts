import type { Meta } from "../../types";

export default {
  name: "Thought Line",
  category: "micro-interactions",
  description: "An AI reasoning indicator: the label ripples letter by letter, the current step shimmers past, and a click unfolds the full trace of steps.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Thinking", description: "Rippling label while running." },
    { name: "doneLabel", type: "string", default: "Thought for {s}s", description: "Label when finished; {s} becomes elapsed seconds." },
    { name: "highlight", type: "string", default: "var(--foreground)", description: "CSS color of the shimmer highlight." },
    { name: "defaultOpen", type: "boolean", default: false, description: "Start with the steps expanded." },
    { name: "steps", type: "node", description: "Reasoning steps so far; the last is the live one." },
    { name: "running", type: "node", description: "Boolean, default true. Set false when finished to show the done label." },
  ],
  usage: `<ThoughtLine steps={reasoning} running={!answer} />`,
} satisfies Meta;
