import type { Meta } from "../../types";

export default {
  name: "Interactive Input",
  category: "components",
  description: "A text field with a floating label, a focus ring that blooms out of the border, a spring-in clear button, a character-count ring and a shake on error.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "label", type: "string", default: "Username", description: "Floating label." },
    { name: "placeholder", type: "string", default: "ada_lovelace", description: "Shown only while focused and empty." },
    { name: "hint", type: "string", default: "Letters, numbers and underscores.", description: "Helper text under the field." },
    { name: "error", type: "string", default: "", description: "Error message. Setting it turns the field red and shakes it." },
    { name: "maxLength", type: "number", min: 5, max: 120, step: 1, default: 20, description: "Max characters, drives the counter ring." },
    { name: "showCounter", type: "boolean", default: true, description: "Show the used / max counter." },
    { name: "clearable", type: "boolean", default: true, description: "Show a clear button when filled." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the field." },
    { name: "icon", type: "node", description: "Leading icon." },
    { name: "value", type: "node", description: "Controlled value; pair with `onValueChange(value)`. Or use `defaultValue`. Native input props are forwarded." },
  ],
  usage: `const [name, setName] = useState("");

<InteractiveInput
  label="Username"
  maxLength={20}
  value={name}
  onValueChange={setName}
  error={name === "admin" ? "That username is taken." : undefined}
/>`,
} satisfies Meta;
