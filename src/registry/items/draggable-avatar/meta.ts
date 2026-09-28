import type { Meta } from "../../types";

export default {
  name: "Draggable Avatar",
  category: "components",
  description: "An avatar you can drag and fling around its container; it springs to the nearest corner with the throw's momentum.",
  dependencies: ["motion"],
  props: [
    { name: "src", type: "string", control: false, description: "Image URL." },
    { name: "alt", type: "string", default: "Avatar", description: "Accessible name." },
    { name: "size", type: "number", min: 40, max: 160, step: 2, default: 88, description: "Avatar size in px." },
    { name: "corner", type: "select", options: ["top-left", "top-right", "bottom-left", "bottom-right"], default: "bottom-right", description: "Corner it starts in." },
    { name: "padding", type: "number", min: 0, max: 48, step: 1, default: 16, description: "Gap to the container edge in px." },
    { name: "shape", type: "select", options: ["circle", "rounded"], default: "circle", description: "Circle or rounded square." },
    { name: "stiffness", type: "number", min: 50, max: 1000, step: 10, default: 380, description: "Spring stiffness of the snap." },
    { name: "damping", type: "number", min: 5, max: 60, step: 1, default: 26, description: "Spring damping. Lower is bouncier." },
    { name: "status", type: "boolean", default: true, description: "Green presence dot." },
  ],
  usage: `<div className="relative h-96 overflow-hidden rounded-3xl">
  <DraggableAvatar src="/me.jpg" alt="Your camera" corner="bottom-right" />
</div>`,
} satisfies Meta;
