import type { Meta } from "../../types";

export default {
  name: "Variable Proximity",
  category: "text-animations",
  description: "Letters grow bolder, larger and brighter the closer the pointer gets, with a tunable radius and falloff.",
  props: [
    { name: "text", type: "string", default: "Every letter leans in when you come close", description: "Text to render." },
    { name: "radius", type: "number", min: 30, max: 400, step: 5, default: 140, description: "Px from the pointer where letters react." },
    {
      name: "falloff",
      type: "select",
      options: ["linear", "exponential", "gaussian"],
      default: "gaussian",
      description: "Response curve from the pointer outwards.",
    },
    { name: "fromWeight", type: "number", min: 100, max: 900, step: 50, default: 400, description: "Weight far from the pointer." },
    { name: "toWeight", type: "number", min: 100, max: 1000, step: 50, default: 900, description: "Weight under the pointer." },
    { name: "scale", type: "number", min: 1, max: 2, step: 0.05, default: 1.15, description: "Scale under the pointer." },
    { name: "activeColor", type: "color", default: "#bef264", description: "Tint near the pointer. Empty to disable." },
    { name: "as", type: "select", options: ["p", "h1", "h2", "h3", "span", "div"], default: "p", description: "Element to render.", control: false },
  ],
  usage: `<VariableProximity text="Every letter leans in" radius={140} falloff="gaussian" />`,
} satisfies Meta;
