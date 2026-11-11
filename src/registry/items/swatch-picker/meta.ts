import type { Meta } from "../../types";

export default {
  name: "Swatch Picker",
  category: "micro-interactions",
  description: "Color swatches where the selection ring glides from one to the next and a check pops in on the chosen color, picking a dark or light check to suit it. Arrow keys move the choice.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Color", description: "Group label." },
    { name: "size", type: "number", min: 20, max: 56, step: 2, default: 32, description: "Swatch diameter in px." },
    { name: "colors", type: "node", description: "Array of { name, value } with hex values." },
    { name: "value", type: "node", description: "Controlled selection, pair with onChange." },
  ],
  usage: `<SwatchPicker
  colors={[{ name: "Lime", value: "#b5e61d" }, { name: "Sky", value: "#38bdf8" }]}
  value={color}
  onChange={setColor}
/>`,
} satisfies Meta;
