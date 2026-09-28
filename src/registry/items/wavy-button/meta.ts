import type { Meta } from "../../types";

export default {
  name: "Wavy Button",
  category: "buttons",
  description: "Liquid sloshes at the bottom and rises in a rolling SVG wave to fill the button on hover.",
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "speed", type: "number", min: 0.5, max: 6, step: 0.1, default: 2.4, description: "Seconds per wave cycle." },
    { name: "restLevel", type: "number", min: 0, max: 50, step: 1, default: 14, description: "Liquid level at rest, % of the button height." },
  ],
  usage: `<WavyButton restLevel={14}>Dive in</WavyButton>`,
} satisfies Meta;
