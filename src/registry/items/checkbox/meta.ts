import type { Meta } from "../../types";

export default {
  name: "Checkbox",
  category: "primitives",
  description: "Native checkbox restyled with a hand-drawn tick animation, indeterminate dash, label and description.",
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Email me product updates", description: "Clickable label." },
    { name: "description", type: "string", default: "About one email a month. Unsubscribe anytime.", description: "Helper text, linked via aria-describedby." },
    { name: "indeterminate", type: "boolean", default: false, description: "Mixed state, shows a dash." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the checkbox." },
    { name: "checked", type: "node", description: "Controlled checked state (or use defaultChecked). All native input props are forwarded." },
  ],
  usage: `<Checkbox name="updates" label="Email me product updates" defaultChecked />`,
} satisfies Meta;
