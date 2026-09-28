import type { Meta } from "../../types";

export default {
  name: "Avatar Group",
  category: "primitives",
  description: "Overlapping avatar stack that fans apart on hover, with name tooltips and a +N overflow chip.",
  isNew: true,
  props: [
    { name: "people", type: "node", description: "Array of { name, src? }." },
    { name: "max", type: "number", min: 1, max: 8, step: 1, default: 4, description: "Avatars shown before the +N chip." },
    { name: "size", type: "number", min: 24, max: 72, step: 2, default: 44, description: "Avatar diameter in px." },
    { name: "overlap", type: "number", min: 0, max: 30, step: 1, default: 14, description: "Px each avatar tucks under the previous one." },
    { name: "spread", type: "boolean", default: true, description: "Fan apart on hover or keyboard focus." },
  ],
  usage: `<AvatarGroup max={4} people={[{ name: "Maya Chen", src: "/maya.jpg" }, { name: "Jonas Weber" }]} />`,
} satisfies Meta;
