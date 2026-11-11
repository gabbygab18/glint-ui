import type { Meta } from "../../types";

export default {
  name: "Icon Shift",
  category: "micro-interactions",
  description: "Swaps one icon for another in place: the old one shrinks, blurs and turns away while the new one turns in and pops to size. Wrap any icon and change its key.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "rotate", type: "number", min: 0, max: 180, step: 5, default: 45, description: "Degrees the icons turn while swapping." },
    { name: "blur", type: "number", min: 0, max: 12, step: 1, default: 4, description: "Blur in px at the swap's start and end." },
    { name: "shrink", type: "number", min: 0, max: 1, step: 0.05, default: 0.4, description: "Scale the icons shrink to while swapping." },
    { name: "duration", type: "number", min: 0.1, max: 0.8, step: 0.02, default: 0.28, description: "Swap length in seconds." },
    { name: "swapKey", type: "node", description: "Identifies the current icon; changing it triggers the swap." },
  ],
  usage: `<IconShift swapKey={copied}>
  {copied ? <Check /> : <Copy />}
</IconShift>`,
} satisfies Meta;
