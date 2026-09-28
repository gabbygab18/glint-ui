import type { Meta } from "../../types";

export default {
  name: "Slider",
  category: "primitives",
  description: "Single or range slider with springy thumbs, a value bubble, tick marks with labels, glide-to-click and full keyboard support (arrows, Page Up/Down, Home/End).",
  isNew: true,
  props: [
    { name: "min", type: "number", min: 0, max: 50, step: 1, default: 0, description: "Lowest value." },
    { name: "max", type: "number", min: 50, max: 1000, step: 10, default: 100, description: "Highest value." },
    { name: "step", type: "number", min: 1, max: 25, step: 1, default: 1, description: "Increment between values." },
    { name: "tooltip", type: "select", options: ["auto", "always", "never"], default: "auto", description: "Value bubble on hover/drag/focus, always, or never." },
    { name: "marks", type: "boolean", default: false, description: "Tick per step (up to 20), or pass values with labels." },
    { name: "disabled", type: "boolean", default: false, description: "Disable interaction." },
    { name: "defaultValue", type: "node", description: "number[]: one value per thumb, two for a range." },
    { name: "formatValue", type: "node", description: "(v) => string for the bubble and aria-valuetext." },
    { name: "name", type: "node", description: "Form field name; one hidden input per thumb." },
  ],
  usage: `<Slider defaultValue={[64]} />
<Slider defaultValue={[20, 80]} step={10} marks formatValue={(v) => \`$\${v}\`} />`,
} satisfies Meta;
