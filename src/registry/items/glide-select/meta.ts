import type { Meta } from "../../types";

export default {
  name: "Glide Select",
  category: "micro-interactions",
  description: "A segmented control whose highlight stretches like a drop of liquid as it glides to the new option, then snaps tight. Arrow keys move it.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "options", type: "list", default: ["Day", "Week", "Month", "Year"], description: "Option labels (also the values)." },
    { name: "stretch", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "How much the highlight stretches while travelling." },
    { name: "label", type: "string", default: "Time range", description: "Accessible name of the group." },
    { name: "color", type: "node", description: "Highlight color (defaults to the theme primary)." },
    { name: "value", type: "node", description: "Controlled selected option. Pair with onValueChange." },
    { name: "defaultValue", type: "node", description: "Initial option when uncontrolled (defaults to the first)." },
    { name: "onValueChange", type: "node", description: "Called with the newly selected option." },
  ],
  usage: `const [range, setRange] = useState("Week");

<GlideSelect options={["Day", "Week", "Month", "Year"]} value={range} onValueChange={setRange} />`,
} satisfies Meta;
