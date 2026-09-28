import type { Meta } from "../../types";

export default {
  name: "Animated Tabs",
  category: "components",
  description: "Tab bar with a springy shared-layout indicator and panels that slide and blur in the direction of travel.",
  dependencies: ["motion"],
  props: [
    { name: "tabs", type: "node", description: "Array of { id, label, icon?, content }." },
    { name: "variant", type: "select", options: ["pill", "underline"], default: "pill", description: "Indicator style." },
    { name: "transition", type: "select", options: ["slide", "fade"], default: "slide", description: "Panel enter/exit style." },
    { name: "bounce", type: "number", min: 0, max: 0.5, step: 0.05, default: 0.2, description: "Spring bounce of the indicator." },
    { name: "defaultTab", type: "string", control: false, description: "Id of the initially selected tab." },
    { name: "onChange", type: "node", description: "Called with the new tab id." },
  ],
  usage: `<AnimatedTabs
  tabs={[
    { id: "overview", label: "Overview", content: <Overview /> },
    { id: "analytics", label: "Analytics", content: <Analytics /> },
  ]}
/>`,
} satisfies Meta;
