import type { Meta } from "../../types";

export default {
  name: "Animated Button",
  category: "buttons",
  description: "On hover a slanted fill sweeps across while the label slides out and an arrow slides in.",
  dependencies: ["lucide-react"],
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "icon", type: "node", description: "Icon that slides in on hover. Defaults to an arrow." },
    { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md", description: "Button size." },
  ],
  usage: `<AnimatedButton size="lg">Get started</AnimatedButton>`,
} satisfies Meta;
