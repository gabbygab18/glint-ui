import type { Meta } from "../../types";

export default {
  name: "Squish Switch",
  category: "micro-interactions",
  description: "Toggle switch whose thumb widens in anticipation while pressed, stretches and flattens as it travels, then bounces into place.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Airplane mode", description: "Visible label and accessible name." },
    { name: "defaultChecked", type: "boolean", default: false, description: "Initial state when uncontrolled." },
    { name: "color", type: "color", default: "#22c55e", description: "Track color when on." },
    { name: "bounce", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Spring bounciness." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the switch." },
    { name: "checked", type: "node", description: "Controlled state, pair with onChange." },
    { name: "onChange", type: "node", description: "(checked: boolean) => void." },
  ],
  usage: `<SquishSwitch label="Airplane mode" checked={airplane} onChange={setAirplane} />`,
} satisfies Meta;
