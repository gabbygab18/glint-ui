import type { Meta } from "../../types";

export default {
  name: "Specular Button",
  category: "buttons",
  description: "A glossy glass pill with a specular hotspot and rim light that glide after the pointer.",
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "tint", type: "color", default: "#ffffff", description: "Color of the specular highlight and edge light." },
  ],
  usage: `<SpecularButton>Continue</SpecularButton>`,
} satisfies Meta;
