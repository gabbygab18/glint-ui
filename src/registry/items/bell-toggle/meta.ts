import type { Meta } from "../../types";

export default {
  name: "Bell Toggle",
  category: "micro-interactions",
  description: "A notification switch whose bell swings and rings when enabled, and gets a drawn slash when muted.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Notifications", description: "Visible label and accessible name." },
    { name: "color", type: "color", default: "#f59e0b", description: "Track and bell color when enabled." },
    { name: "defaultChecked", type: "boolean", default: true, description: "Initial state when uncontrolled." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the switch." },
    { name: "checked", type: "node", description: "Controlled state. Pair with onCheckedChange." },
    { name: "onCheckedChange", type: "node", description: "Called with the new state after each toggle." },
  ],
  usage: `const [on, setOn] = useState(true);

<BellToggle checked={on} onCheckedChange={setOn} label="Notifications" />`,
} satisfies Meta;
