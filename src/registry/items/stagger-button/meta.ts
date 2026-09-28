import type { Meta } from "../../types";

export default {
  name: "Stagger Button",
  category: "buttons",
  description: "Each letter of the label rolls upward one after another on hover.",
  isNew: true,
  props: [
    { name: "children", type: "string", default: "Explore the docs", description: "Button label (plain text)." },
    { name: "stagger", type: "number", min: 0, max: 100, step: 5, default: 25, description: "Ms between each letter starting to roll." },
    { name: "duration", type: "number", min: 150, max: 1200, step: 50, default: 450, description: "Ms each letter takes to roll." },
  ],
  usage: `<StaggerButton stagger={25}>Explore the docs</StaggerButton>`,
} satisfies Meta;
