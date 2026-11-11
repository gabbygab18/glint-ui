import type { Meta } from "../../types";

export default {
  name: "Goal Ring",
  category: "widgets",
  description: "Concentric progress rings that fill when they scroll into view, each a beat after the last, while the center counts up to the outer ring's percent. With a legend.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "size", type: "number", min: 120, max: 320, step: 10, default: 200, description: "Diameter in px." },
    { name: "thickness", type: "number", min: 6, max: 28, step: 1, default: 16, description: "Ring thickness in px." },
    { name: "gap", type: "number", min: 0, max: 16, step: 1, default: 5, description: "Space between rings in px." },
    { name: "duration", type: "number", min: 0.3, max: 3, step: 0.1, default: 1.4, description: "Fill length in seconds." },
    { name: "showLegend", type: "boolean", default: true, description: "List each ring below." },
    { name: "rings", type: "node", description: "Array of { label, value, goal, color, unit? }." },
  ],
  usage: `<GoalRing
  rings={[
    { label: "Move", value: 420, goal: 500, color: "#f43f5e", unit: "kcal" },
    { label: "Exercise", value: 24, goal: 30, color: "#b5e61d", unit: "min" },
  ]}
/>`,
} satisfies Meta;
