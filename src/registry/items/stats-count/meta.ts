import type { Meta } from "../../types";

export default {
  name: "Stats Count",
  category: "components",
  description: "A row of big statistics that count up with a staggered reveal when scrolled into view.",
  props: [
    { name: "stats", type: "node", description: "Array of { value, label, prefix?, suffix?, decimals?, description? }." },
    { name: "duration", type: "number", min: 300, max: 5000, step: 100, default: 2200, description: "Ms each number takes to count up." },
    { name: "stagger", type: "number", min: 0, max: 600, step: 20, default: 140, description: "Ms between each stat starting." },
    { name: "dividers", type: "boolean", default: true, description: "Hairline dividers between stats." },
    { name: "repeat", type: "boolean", default: false, description: "Count again each time it re-enters the viewport." },
    { name: "accent", type: "color", default: "#a3e635", description: "Color of the bar that sweeps under each number." },
  ],
  usage: `<StatsCount
  stats={[
    { value: 2.4, decimals: 1, suffix: "M", label: "Deploys a week" },
    { value: 99.99, decimals: 2, suffix: "%", label: "Uptime" },
  ]}
/>`,
} satisfies Meta;
