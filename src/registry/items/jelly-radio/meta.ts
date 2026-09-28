import type { Meta } from "../../types";

export default {
  name: "Jelly Radio",
  category: "micro-interactions",
  description: "A radio group with one gooey dot that stretches as it slides to the new option, splats on landing and jiggles back into shape.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Plan", description: "Group label." },
    { name: "defaultValue", type: "select", options: ["starter", "pro", "enterprise"], default: "pro", description: "Initial value when uncontrolled." },
    { name: "color", type: "color", default: "#fb7185", description: "Dot and ring color." },
    { name: "wobble", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "How jelly-like the dot is." },
    { name: "options", type: "node", description: "Array of { value, label, description? }." },
    { name: "value", type: "node", description: "Controlled value. Pair with onValueChange." },
    { name: "onValueChange", type: "node", description: "Called with the newly selected value." },
    { name: "name", type: "node", description: "Form field name for the native radios." },
  ],
  usage: `<JellyRadio
  options={[
    { value: "starter", label: "Starter" },
    { value: "pro", label: "Pro" },
  ]}
  value={plan}
  onValueChange={setPlan}
/>`,
} satisfies Meta;
