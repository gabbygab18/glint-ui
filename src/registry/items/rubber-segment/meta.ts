import type { Meta } from "../../types";

export default {
  name: "Rubber Segment",
  category: "micro-interactions",
  description: "Segmented control whose pill indicator stretches like rubber toward the new option, thins out as it pulls, then snaps shut.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "options", type: "list", default: ["Day", "Week", "Month", "Year"], description: "Segment labels." },
    { name: "stretch", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "How stretchy the indicator is." },
    { name: "label", type: "string", default: "View", description: "Accessible name of the group." },
    { name: "value", type: "node", description: "Controlled selected option, pair with onChange." },
    { name: "defaultValue", type: "node", description: "Initial option when uncontrolled (defaults to the first)." },
    { name: "onChange", type: "node", description: "(value: string) => void." },
  ],
  usage: `<RubberSegment options={["Day", "Week", "Month"]} value={range} onChange={setRange} />`,
} satisfies Meta;
