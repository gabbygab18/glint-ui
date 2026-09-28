import type { Meta } from "../../types";

export default {
  name: "Wake Slider",
  category: "micro-interactions",
  description: "A range slider whose thumb drags a glowing wake behind it and squashes when flicked fast. Built on a native range input, so keyboard and forms just work.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Volume", description: "Visible label." },
    { name: "defaultValue", type: "number", min: 0, max: 100, step: 1, default: 40, description: "Starting value (uncontrolled)." },
    { name: "min", type: "number", min: 0, max: 50, step: 1, default: 0, description: "Minimum." },
    { name: "max", type: "number", min: 50, max: 1000, step: 10, default: 100, description: "Maximum." },
    { name: "step", type: "number", min: 1, max: 25, step: 1, default: 1, description: "Step size." },
    { name: "color", type: "color", default: "#38bdf8", description: "Wake and thumb color." },
    { name: "trail", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "How long the wake lingers behind the thumb." },
    { name: "showValue", type: "boolean", default: true, description: "Show the current value." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the slider." },
    { name: "value", type: "node", description: "Controlled value; pair with onChange(value)." },
  ],
  usage: `<WakeSlider label="Volume" value={volume} onChange={setVolume} />`,
} satisfies Meta;
