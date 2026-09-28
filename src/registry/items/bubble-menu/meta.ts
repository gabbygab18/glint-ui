import type { Meta } from "../../types";

export default {
  name: "Bubble Menu",
  category: "components",
  description: "A pill navbar whose toggle bursts into a cloud of springy bubble links that pop in one after another.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { label, href, color? }." },
    { name: "logo", type: "node", description: "Content of the left pill." },
    { name: "position", type: "select", options: ["fixed", "absolute"], default: "fixed", control: false, description: "`absolute` renders inside the nearest positioned parent." },
    { name: "stagger", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.07, description: "Seconds between bubbles." },
    { name: "tilt", type: "number", min: 0, max: 15, step: 1, default: 6, description: "Max resting tilt in degrees." },
    { name: "fontSize", type: "number", min: 16, max: 56, step: 1, default: 34, description: "Label size in px." },
    { name: "defaultOpen", type: "boolean", default: false, control: false, description: "Start open." },
  ],
  usage: `<BubbleMenu
  logo={<span>acme</span>}
  items={[
    { label: "Home", href: "/", color: "#3b82f6" },
    { label: "About", href: "/about", color: "#10b981" },
  ]}
/>`,
} satisfies Meta;
