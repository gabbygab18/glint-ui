import type { Meta } from "../../types";

export default {
  name: "Elastic Slider",
  category: "components",
  description: "Range slider whose track stretches like rubber when dragged past either end, then springs back. Keyboard accessible.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "defaultValue", type: "number", min: 0, max: 100, step: 1, default: 50, description: "Starting value." },
    { name: "min", type: "number", min: -100, max: 0, step: 1, default: 0, description: "Lowest value." },
    { name: "max", type: "number", min: 10, max: 1000, step: 10, default: 100, description: "Highest value." },
    { name: "step", type: "number", min: 0.1, max: 10, step: 0.1, default: 1, description: "Value increment." },
    { name: "stretch", type: "number", min: 0, max: 80, step: 2, default: 28, description: "Max px the track stretches past an end." },
    { name: "showValue", type: "boolean", default: true, description: "Show the value under the track." },
    { name: "label", type: "string", default: "Volume", description: "Accessible name." },
    { name: "leftIcon", type: "node", description: "Icon at the low end." },
    { name: "rightIcon", type: "node", description: "Icon at the high end." },
    { name: "onValueChange", type: "node", description: "Called with the new value." },
  ],
  usage: `<ElasticSlider defaultValue={50} max={100} leftIcon={<Volume />} rightIcon={<Volume2 />} />`,
} satisfies Meta;
