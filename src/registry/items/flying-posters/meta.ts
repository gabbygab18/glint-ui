import type { Meta } from "../../types";

export default {
  name: "Flying Posters",
  category: "components",
  description: "Posters fly through 3D space in a curving vertical stream you steer by scrolling or dragging inside the container.",
  props: [
    { name: "images", type: "node", description: "Array of image URLs." },
    { name: "speed", type: "number", min: -2, max: 2, step: 0.05, default: 0.35, description: "Idle drift in posters per second." },
    { name: "posterWidth", type: "number", min: 120, max: 360, step: 10, default: 200, description: "Poster width in px." },
    { name: "curve", type: "number", min: 0, max: 1, step: 0.05, default: 0.7, description: "How far the stream bends away." },
    { name: "sway", type: "number", min: 0, max: 240, step: 10, default: 160, description: "Horizontal scatter in px." },
  ],
  usage: `<div className="h-[32rem]">
  <FlyingPosters images={posters} speed={0.35} />
</div>`,
} satisfies Meta;
