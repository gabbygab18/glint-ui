import type { Meta } from "../../types";

export default {
  name: "Radio Group",
  category: "primitives",
  description: "Native radio group restyled with a springy dot and ripple, plus a card variant whose selection outline slides between options. Arrow keys just work.",
  isNew: true,
  dependencies: ["motion"],
  props: [
    { name: "variant", type: "select", options: ["default", "card"], default: "default", description: "Plain radios or selectable cards." },
    { name: "orientation", type: "select", options: ["vertical", "horizontal"], default: "vertical", description: "Layout direction." },
    { name: "disabled", type: "boolean", default: false, description: "Disable every option." },
    { name: "defaultValue", type: "string", control: false, description: "Initially selected value (uncontrolled)." },
    { name: "value", type: "node", description: "Controlled value (with onValueChange)." },
    { name: "name", type: "node", description: "Form field name. Auto-generated if omitted." },
    { name: "children", type: "node", description: "RadioGroupItem elements (value, label, description, icon, disabled)." },
  ],
  usage: `<RadioGroup variant="card" defaultValue="pro" aria-label="Plan">
  <RadioGroupItem value="hobby" label="Hobby" description="Personal projects" />
  <RadioGroupItem value="pro" label="Pro" description="$20 / month" />
</RadioGroup>`,
} satisfies Meta;
