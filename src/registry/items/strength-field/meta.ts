import type { Meta } from "../../types";

export default {
  name: "Strength Field",
  category: "components",
  description: "A password field with a segmented strength meter that fills and warms toward green as rules are met, a rolling verdict word, a rule checklist and a show/hide toggle.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Password", description: "Field label." },
    { name: "placeholder", type: "string", default: "Create a password", description: "Placeholder text." },
    { name: "showRules", type: "boolean", default: true, description: "List the rules with a check per rule met." },
    { name: "rules", type: "node", description: "Array of { label, test(value) }. Each rule met adds a segment." },
    { name: "value", type: "node", description: "Controlled value, pair with onChange(value)." },
  ],
  usage: `<StrengthField value={password} onChange={setPassword} />`,
} satisfies Meta;
