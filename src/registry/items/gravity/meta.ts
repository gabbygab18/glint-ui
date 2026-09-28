import type { Meta } from "../../types";

export default {
  name: "Gravity",
  category: "animations",
  description: "Drops any elements into a real physics box where they tumble, stack, and can be grabbed and thrown.",
  dependencies: ["matter-js"],
  props: [
    { name: "children", type: "node", description: "Each direct child becomes a physics body." },
    { name: "gravity", type: "number", min: -1, max: 3, step: 0.1, default: 1, description: "Downward gravity; negative floats things up." },
    { name: "bounce", type: "number", min: 0, max: 1, step: 0.05, default: 0.35, description: "Restitution, 0 = dead stop, 1 = superball." },
    { name: "friction", type: "number", min: 0, max: 1, step: 0.05, default: 0.2, description: "Surface friction between bodies." },
    { name: "startOnView", type: "boolean", default: true, description: "Wait until the container scrolls into view before dropping." },
  ],
  usage: `<Gravity className="h-96">
  <span className="rounded-full bg-lime-300 px-5 py-2">React</span>
  <span className="rounded-full bg-cyan-300 px-5 py-2">Physics</span>
</Gravity>`,
} satisfies Meta;
