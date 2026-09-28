import type { Meta } from "../../types";

export default {
  name: "Folder",
  category: "components",
  description: "A folder that springs open on hover or click, fanning out the paper cards tucked inside.",
  props: [
    { name: "color", type: "color", default: "#5b8cff", description: "Folder color." },
    { name: "size", type: "number", min: 80, max: 320, step: 10, default: 180, description: "Folder width in px." },
    { name: "label", type: "string", default: "Projects", description: "Text under the folder." },
    { name: "openOnHover", type: "boolean", default: true, description: "Open while hovered, not only on click." },
    { name: "items", type: "node", description: "Up to three paper cards revealed when open." },
  ],
  usage: `<Folder color="#5b8cff" label="Projects" items={[<img src="/a.jpg" alt="" />, <img src="/b.jpg" alt="" />]} />`,
} satisfies Meta;
