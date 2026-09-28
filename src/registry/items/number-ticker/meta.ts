import type { Meta } from "../../types";

export default {
  name: "Number Ticker",
  category: "widgets",
  description: "An odometer-style number in a squircle window: every digit is a 0-9 strip that rolls to its new value.",
  isNew: true,
  dependencies: ["motion", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "value", type: "number", min: 0, max: 1000000, step: 1, control: false, description: "The number to show. Changing it rolls the digits." },
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Surface palette." },
    { name: "duration", type: "number", min: 0.1, max: 3, step: 0.05, default: 0.7, description: "Seconds for each digit to settle." },
    { name: "stagger", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.05, description: "Delay between digits, in seconds (right to left)." },
    { name: "direction", type: "select", options: ["up", "down"], default: "up", description: "Roll the digit strips upward or downward." },
    { name: "prefix", type: "string", default: "", description: "Static text before the digits." },
    { name: "suffix", type: "string", default: "", description: "Static text after the digits." },
    { name: "format", type: "node", description: "`(value) => string`. Defaults to a grouped en-US number." },
  ],
  usage: `<NumberTicker value={12847} variant="calamansi" className="text-5xl" />`,
} satisfies Meta;
