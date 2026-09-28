import type { Meta } from "../../types";

export default {
  name: "Meteor Orbit",
  category: "components",
  description: "Icons circling a center on concentric rings while glowing meteor streaks race along each orbit.",
  props: [
    { name: "items", type: "node", description: "Array of { label, icon }, spread round-robin over the rings." },
    { name: "children", type: "node", description: "Content in the middle." },
    { name: "size", type: "number", min: 240, max: 640, step: 10, default: 400, description: "Outer diameter in px." },
    { name: "rings", type: "number", min: 1, max: 5, step: 1, default: 3, description: "Number of orbits." },
    { name: "duration", type: "number", min: 6, max: 80, step: 1, default: 24, description: "Seconds per turn of the inner ring." },
    { name: "meteors", type: "number", min: 0, max: 4, step: 1, default: 2, description: "Meteor streaks per ring." },
    { name: "meteorColor", type: "color", default: "#a3e635", description: "Meteor glow color." },
    { name: "iconSize", type: "number", min: 28, max: 72, step: 2, default: 44, description: "Icon bubble size in px." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Freeze everything while hovered." },
  ],
  usage: `<MeteorOrbit items={[{ label: "Database", icon: <Database /> }, { label: "Cloud", icon: <Cloud /> }]}>
  <Logo />
</MeteorOrbit>`,
} satisfies Meta;
