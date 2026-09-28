import type { Meta } from "../../types";

export default {
  name: "Calendar",
  category: "primitives",
  description: "Dependency-free date picker grid with single or range selection, springy month slides, range preview on hover and full keyboard navigation.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "mode", type: "select", options: ["single", "range"], default: "single", description: "Pick one day or a from/to range." },
    { name: "weekStartsOn", type: "number", min: 0, max: 1, step: 1, default: 0, description: "0 = Sunday, 1 = Monday." },
    { name: "locale", type: "string", default: "en-US", description: "BCP 47 locale for month and weekday names." },
    { name: "selected", type: "node", description: "Controlled selection: Date (single) or { from, to } (range)." },
    { name: "defaultSelected", type: "node", description: "Initial selection when uncontrolled." },
    { name: "onSelect", type: "node", description: "Called with the picked Date, or the updated range." },
    { name: "defaultMonth", type: "node", description: "Month shown first (Date)." },
    { name: "min", type: "node", description: "Earliest selectable day (Date)." },
    { name: "max", type: "node", description: "Latest selectable day (Date)." },
    { name: "isDateDisabled", type: "node", description: "(date) => boolean to block specific days." },
  ],
  usage: `const [range, setRange] = useState<DateRange>();

<Calendar mode="range" selected={range} onSelect={setRange} weekStartsOn={1} />`,
} satisfies Meta;
