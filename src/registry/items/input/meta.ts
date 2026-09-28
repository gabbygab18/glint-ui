import type { Meta } from "../../types";

export default {
  name: "Input",
  category: "primitives",
  description: "Text input with icon slots, three sizes, a focus line that sweeps out from the center and an error state that shakes and slides in its message.",
  isNew: true,
  props: [
    { name: "placeholder", type: "string", default: "Search components...", description: "Placeholder text. All native input props are forwarded." },
    { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md", description: "Height, padding and text size." },
    { name: "error", type: "string", default: "", description: "Error message (or true) marks the field invalid and links the message via aria-describedby." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the input." },
    { name: "startIcon", type: "node", description: "Icon before the value." },
    { name: "endIcon", type: "node", description: "Icon, text or small button after the value." },
  ],
  usage: `<Input placeholder="Email" startIcon={<AtSign />} error={invalid && "Enter a valid email"} />`,
} satisfies Meta;
