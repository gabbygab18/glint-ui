import type { Meta } from "../../types";

export default {
  name: "Counter",
  category: "components",
  description: "An odometer-style number where every digit column rolls on a spring, with − / + controls and soft faded edges.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "value", type: "number", min: 0, max: 99999, step: 1, default: 128, description: "Starting value. Changing it jumps the counter." },
    { name: "step", type: "number", min: 1, max: 1000, step: 1, default: 1, description: "Amount per button press." },
    { name: "min", type: "number", min: 0, max: 1000, step: 1, default: 0, description: "Lowest value." },
    { name: "max", type: "number", min: 1, max: 999999, step: 1, default: 999999, description: "Highest value." },
    { name: "fontSize", type: "number", min: 24, max: 160, step: 2, default: 80, description: "Digit size in px." },
    { name: "showControls", type: "boolean", default: true, description: "Show the − / + buttons." },
    { name: "fade", type: "boolean", default: true, description: "Fade digits at the top and bottom." },
    { name: "onChange", type: "node", description: "(value: number) => void, called after a button press." },
  ],
  usage: `<Counter value={128} step={1} fontSize={80} />`,
} satisfies Meta;
