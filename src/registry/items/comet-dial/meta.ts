import type { Meta } from "../../types";

export default {
  name: "Comet Dial",
  category: "micro-interactions",
  description: "A drag-around knob whose indicator trails a glowing comet tail, with a live readout and full arrow-key support.",
  isNew: true,
  props: [
    { name: "defaultValue", type: "number", min: 0, max: 100, step: 1, default: 40, description: "Initial value when uncontrolled." },
    { name: "min", type: "number", min: -100, max: 0, step: 1, default: 0, description: "Lowest value." },
    { name: "max", type: "number", min: 10, max: 1000, step: 10, default: 100, description: "Highest value." },
    { name: "step", type: "number", min: 0.1, max: 10, step: 0.1, default: 1, description: "Value increment." },
    { name: "color", type: "color", default: "#38bdf8", description: "Comet and arc color." },
    { name: "size", type: "number", min: 140, max: 320, step: 10, default: 220, description: "Diameter in px." },
    { name: "label", type: "string", default: "Volume", description: "Caption and accessible name." },
    { name: "unit", type: "string", default: "%", description: "Suffix after the number." },
    { name: "disabled", type: "boolean", default: false, description: "Disable interaction." },
    { name: "value", type: "node", description: "Controlled value. Pair with onChange." },
    { name: "onChange", type: "node", description: "Called with the new value." },
  ],
  usage: `const [volume, setVolume] = useState(40);

<CometDial value={volume} onChange={setVolume} label="Volume" unit="%" />`,
} satisfies Meta;
