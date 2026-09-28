import type { Meta } from "../../types";

export default {
  name: "Sling Button",
  category: "buttons",
  description: "Pull the button back on rubber bands and let go: past the threshold it fires and whips home with overshoot. A normal click works too.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "threshold", type: "number", min: 10, max: 150, step: 5, default: 50, description: "Px the button must be pulled back to fire on release." },
    { name: "elasticity", type: "number", min: 0.1, max: 1, step: 0.05, default: 0.5, description: "How far the button follows the pointer while pulled." },
  ],
  usage: `<SlingButton threshold={50} onClick={() => fire()}>Launch</SlingButton>`,
} satisfies Meta;
