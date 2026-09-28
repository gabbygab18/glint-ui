import type { Meta } from "../../types";

export default {
  name: "Slosh Gauge",
  category: "micro-interactions",
  description: "Round liquid gauge whose level springs to each new value and sloshes side to side before settling, with the readout inverting where the liquid covers it. Drag or key it to set the level.",
  isNew: true,
  props: [
    { name: "defaultValue", type: "number", min: 0, max: 100, step: 1, default: 62, description: "Initial level when uncontrolled." },
    { name: "color", type: "color", default: "#38bdf8", description: "Liquid color." },
    { name: "size", type: "number", min: 120, max: 320, step: 4, default: 208, description: "Diameter in px." },
    { name: "slosh", type: "number", min: 0, max: 2, step: 0.1, default: 1, description: "How much the liquid sloshes." },
    { name: "interactive", type: "boolean", default: true, description: "Let the user drag or key the level (slider); off makes it a meter." },
    { name: "label", type: "string", default: "Tank level", description: "Accessible name." },
    { name: "value", type: "node", description: "Controlled level 0-100, pair with onChange." },
    { name: "onChange", type: "node", description: "(value: number) => void." },
  ],
  usage: `<SloshGauge value={storage} onChange={setStorage} color="#38bdf8" />`,
} satisfies Meta;
