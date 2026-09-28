import type { Meta } from "../../types";

export default {
  name: "Task Widget",
  category: "widgets",
  description: "An iOS-like glass widget with a live clock, weather line and tactile task cards that frost toward the tail of the list.",
  isNew: true,
  dependencies: ["motion", "lucide-react", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "variant", type: "select", options: ["calamansi", "slate", "citrus", "black", "dark"], default: "calamansi", description: "Glass tint." },
    { name: "corner", type: "select", options: ["rounded", "squircle"], default: "rounded", description: "Shell corner: large radius, or a squircle." },
    { name: "title", type: "string", default: "Today", description: "Section title above the task list." },
    { name: "showClock", type: "boolean", default: true, description: "Show the live clock." },
    { name: "timeFormat", type: "select", options: ["12h", "24h"], default: "12h", description: "Clock format." },
    { name: "tasks", type: "node", description: "Controlled `{ id, title, completed?, tag?, icon? }[]`." },
    { name: "defaultTasks", type: "node", description: "Initial tasks when uncontrolled. Ships with five samples." },
    { name: "onTaskToggle", type: "node", description: "`(id, completed) => void`, fired when a card is toggled." },
    { name: "weather", type: "node", description: "`{ condition?, temperature?, icon? }`. Falls back to Sunny / Starry by color scheme." },
  ],
  usage: `<TaskWidget
  weather={{ condition: "Sunny", temperature: "31°" }}
  defaultTasks={[{ id: 1, title: "Review PRs" }, { id: 2, title: "Ship it", completed: true }]}
/>`,
} satisfies Meta;
