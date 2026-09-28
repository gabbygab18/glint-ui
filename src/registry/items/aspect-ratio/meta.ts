import type { Meta } from "../../types";

export default {
  name: "Aspect Ratio",
  category: "primitives",
  description: "Box locked to a width/height ratio, with a shimmer placeholder that dissolves into the image once it loads.",
  isNew: true,
  props: [
    { name: "ratio", type: "number", min: 0.5, max: 3, step: 0.05, default: 16 / 9, description: "Width divided by height, e.g. 16 / 9." },
    { name: "shimmer", type: "boolean", default: true, description: "Animated placeholder until the image loads." },
    { name: "src", type: "string", description: "Image rendered with object-cover. Omit to place your own children." },
    { name: "alt", type: "string", default: "", description: "Alt text for the image." },
    { name: "children", type: "node", description: "Any content (video, iframe, map) to fit inside the box." },
  ],
  usage: `<AspectRatio ratio={16 / 9} src="/cover.jpg" alt="Mountain lake at dawn" className="rounded-xl" />`,
} satisfies Meta;
