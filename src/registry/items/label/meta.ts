import type { Meta } from "../../types";

export default {
  name: "Label",
  category: "primitives",
  description: "Form label with a required asterisk, optional tag and hint text that lights up while its control has focus.",
  isNew: true,
  props: [
    { name: "children", type: "string", default: "Work email", description: "Label text." },
    { name: "required", type: "boolean", default: false, description: "Show the required marker (also set required on the input)." },
    { name: "optional", type: "boolean", default: false, description: "Show an \"Optional\" tag instead." },
    { name: "hint", type: "string", default: "We only use this to send your invoice.", description: "Helper text, id is `${htmlFor}-hint`." },
    { name: "disabled", type: "boolean", default: false, description: "Dimmed, not-allowed cursor." },
    { name: "htmlFor", type: "node", description: "Id of the control. Also used to light up on focus and to build the hint id." },
  ],
  usage: `<Label htmlFor="email" required hint="We never share it.">Email</Label>
<input id="email" required aria-describedby="email-hint" />`,
} satisfies Meta;
