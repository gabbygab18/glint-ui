import type { Meta } from "../../types";

export default {
  name: "Select",
  category: "primitives",
  description: "Custom listbox select in the native top layer: grouped options with icons, a gliding highlight, drawn check marks, typeahead, full keyboard support and a real form value.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "placeholder", type: "string", default: "Select an option", description: "Shown when nothing is selected." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the trigger." },
    { name: "required", type: "boolean", default: false, description: "Native form validation when `name` is set." },
    { name: "options", type: "node", description: "(SelectOption | { label, options: SelectOption[] })[]; SelectOption = { value, label, icon?, description?, disabled? }." },
    { name: "value", type: "node", description: "Selected value (controlled, with onValueChange)." },
    { name: "defaultValue", type: "node", description: "Initial value (uncontrolled)." },
    { name: "name", type: "node", description: "Form field name; submitted like a native select." },
  ],
  usage: `<Select
  name="fruit"
  placeholder="Pick a fruit"
  options={[
    { label: "Fruits", options: [{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }] },
  ]}
/>`,
} satisfies Meta;
