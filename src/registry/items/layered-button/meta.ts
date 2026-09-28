import type { Meta } from "../../types";

export default {
  name: "Layered Button",
  category: "buttons",
  description: "A 3D keycap of stacked offset layers that spread on hover and compress on press.",
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "layers", type: "number", min: 1, max: 6, step: 1, default: 3, description: "Number of layers stacked under the face." },
    { name: "depth", type: "number", min: 2, max: 10, step: 1, default: 4, description: "Px between layers at rest." },
  ],
  usage: `<LayeredButton layers={3} depth={4}>Press me</LayeredButton>`,
} satisfies Meta;
