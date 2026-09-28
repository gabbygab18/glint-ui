import type { Meta } from "../../types";

export default {
  name: "Duration Picker",
  category: "widgets",
  description: "Hours, minutes and a save button fused into one bar that pulls apart on a liquid thread while you edit.",
  isNew: true,
  dependencies: ["motion", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Palette the save button and the bead wear." },
    { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md", description: "Bar height, and with it the corner, travel and field widths." },
    { name: "maxHours", type: "number", min: 1, max: 99, step: 1, default: 24, description: "Ceiling for the hours field." },
    { name: "maxMinutes", type: "number", min: 1, max: 60, step: 1, default: 60, description: "Ceiling for the minutes field." },
    { name: "hoursLabel", type: "string", default: "Hr.", description: "Unit after the hours field." },
    { name: "minutesLabel", type: "string", default: "Min.", description: "Unit after the minutes field." },
    { name: "threshold", type: "number", min: 8, max: 40, step: 1, default: 19, description: "Alpha ramp slope: how hard the fused edge is." },
    { name: "gooey", type: "boolean", default: true, description: "Run the metaball fuse. Off, the pieces just slide apart." },
    { name: "bead", type: "boolean", default: true, description: "Leave a drop of juice where the thread severs." },
    { name: "disabled", type: "boolean", default: false, description: "Disable editing." },
    { name: "value", type: "node", description: "Controlled `{ hours, minutes }`." },
    { name: "defaultValue", type: "node", description: "Initial `{ hours, minutes }` when uncontrolled." },
    { name: "onChange", type: "node", description: "`(value) => void`, fired on every keystroke with the clamped value." },
    { name: "onConfirm", type: "node", description: "`(value) => void`, fired on save (tick or Enter)." },
    { name: "editing", type: "boolean", control: false, description: "Hold the bar open or shut (controlled)." },
    { name: "defaultEditing", type: "boolean", default: false, control: false, description: "Open on mount when uncontrolled." },
    { name: "onEditingChange", type: "node", description: "`(editing) => void`, fired when the pieces split or merge." },
    { name: "gap", type: "number", min: 4, max: 32, control: false, description: "How far the seams open on each side, in px (defaults per size)." },
    { name: "radius", type: "number", min: 4, max: 32, control: false, description: "Override the corner radius in px." },
    { name: "viscosity", type: "number", min: 1, max: 30, control: false, description: "Fuse blur in px. Defaults to 0.55 of the gap." },
  ],
  usage: `const [value, setValue] = useState({ hours: 1, minutes: 30 });

<DurationPicker value={value} onChange={setValue} onConfirm={save} />`,
} satisfies Meta;
