import type { Meta } from "../../types";

export default {
  name: "Morph Slider",
  category: "components",
  description: "Range slider whose thumb stretches with drag speed and drips a gooey value bubble while you slide.",
  dependencies: ["motion"],
  props: [
    { name: "min", type: "number", min: -100, max: 100, step: 1, default: 0, description: "Minimum value." },
    { name: "max", type: "number", min: 1, max: 1000, step: 1, default: 100, description: "Maximum value." },
    { name: "step", type: "number", min: 1, max: 20, step: 1, default: 1, description: "Value increment." },
    { name: "defaultValue", type: "number", min: 0, max: 100, step: 1, default: 42, description: "Initial value when uncontrolled." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Thumb, fill and bubble color." },
    { name: "textColor", type: "color", default: "#0a0a0a", description: "Value text color inside the bubble." },
    { name: "suffix", type: "string", default: "%", description: "Text appended to the value." },
    { name: "label", type: "string", default: "Value", description: "Accessible name." },
    { name: "value", type: "node", description: "Controlled value (pair with onChange)." },
    { name: "onChange", type: "node", description: "(value: number) => void" },
  ],
  usage: `<MorphSlider defaultValue={42} suffix="%" onChange={(v) => console.log(v)} />`,
} satisfies Meta;
