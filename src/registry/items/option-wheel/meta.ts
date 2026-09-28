import type { Meta } from "../../types";

export default {
  name: "Option Wheel",
  category: "components",
  description: "iOS-style picker wheel: rows curve around a 3D cylinder, snap into place and respond to wheel, drag, touch and arrow keys.",
  props: [
    { name: "options", type: "node", description: "string[] of choices." },
    { name: "defaultIndex", type: "number", min: 0, max: 11, step: 1, default: 0, control: false, description: "Initially selected index." },
    { name: "itemHeight", type: "number", min: 28, max: 64, step: 2, default: 40, description: "Row height in px." },
    { name: "visibleCount", type: "number", min: 3, max: 9, step: 2, default: 5, description: "Rows visible at once." },
    { name: "curvature", type: "number", min: 0, max: 35, step: 1, default: 20, description: "Degrees each row turns away from the center." },
    { name: "loop", type: "boolean", default: false, description: "Loop the wheel so it never hits an end." },
    { name: "label", type: "string", default: "Options", description: "Accessible name." },
    { name: "onChange", type: "node", description: "(value: string, index: number) => void" },
  ],
  usage: `<OptionWheel options={["Small", "Medium", "Large"]} onChange={(v) => setSize(v)} />`,
} satisfies Meta;
