import type { Meta } from "../../types";

export default {
  name: "Orb Button",
  category: "buttons",
  description: "A glowing gradient orb drifts inside the button and swells to chase the pointer on hover.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "colorA", type: "color", default: "#a78bfa", description: "Orb core color." },
    { name: "colorB", type: "color", default: "#22d3ee", description: "Orb outer color." },
  ],
  usage: `<OrbButton colorA="#a78bfa" colorB="#22d3ee">Start building</OrbButton>`,
} satisfies Meta;
