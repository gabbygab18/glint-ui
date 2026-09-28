import type { Meta } from "../../types";

export default {
  name: "Spring Check",
  category: "micro-interactions",
  description: "Checkbox that squashes on press, pops and wobbles when checked, floods with color from the center and springs its tick in with a spark burst.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Ship it", description: "Label text (any node)." },
    { name: "defaultChecked", type: "boolean", default: false, description: "Initial state when uncontrolled." },
    { name: "color", type: "color", default: "#22c55e", description: "Fill color when checked." },
    { name: "size", type: "number", min: 16, max: 56, step: 2, default: 28, description: "Box size in px." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the checkbox." },
    { name: "checked", type: "node", description: "Controlled state, pair with onChange." },
    { name: "onChange", type: "node", description: "(checked: boolean) => void." },
  ],
  usage: `<SpringCheck label="Ship it" checked={ready} onChange={setReady} />`,
} satisfies Meta;
