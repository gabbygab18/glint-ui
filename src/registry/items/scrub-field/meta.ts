import type { Meta } from "../../types";

export default {
  name: "Scrub Field",
  category: "micro-interactions",
  description: "Design-tool number field: drag sideways to scrub the value over a sliding tick ruler, Shift for coarse, Alt for fine, and it stretches like rubber at the limits. Click to type, arrows to step.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Opacity", description: "Field label." },
    { name: "unit", type: "string", default: "%", description: "Suffix after the number." },
    { name: "min", type: "number", min: -1000, max: 0, step: 1, default: 0, description: "Minimum value." },
    { name: "max", type: "number", min: 1, max: 1000, step: 1, default: 100, description: "Maximum value." },
    { name: "step", type: "number", min: 0.01, max: 10, step: 0.01, default: 1, description: "Step per notch. Alt scrubs at a tenth of it." },
    { name: "pixelsPerStep", type: "number", min: 1, max: 20, step: 1, default: 4, description: "Pointer px per step while scrubbing." },
    { name: "value", type: "node", description: "Controlled value, pair with onChange." },
    { name: "defaultValue", type: "node", description: "Initial value when uncontrolled (64)." },
    { name: "onChange", type: "node", description: "(value: number) => void." },
  ],
  usage: `<ScrubField label="Radius" unit="px" min={0} max={72} value={radius} onChange={setRadius} />`,
} satisfies Meta;
