import type { Meta } from "../../types";

export default {
  name: "Flip Flow",
  category: "components",
  description: "Split-flap tiles that flip through their items like a flip clock, the top half falling over a hinge; stagger several to make a flipping stream.",
  props: [
    { name: "items", type: "node", description: "Array of nodes to cycle through; each fills the tile." },
    { name: "interval", type: "number", min: 1000, max: 8000, step: 100, default: 2600, description: "Ms between flips." },
    { name: "duration", type: "number", min: 200, max: 2000, step: 50, default: 800, description: "Ms one flip takes." },
    { name: "radius", type: "number", min: 0, max: 32, step: 1, default: 16, description: "Corner radius in px." },
    { name: "paused", type: "boolean", default: false, description: "Stop cycling." },
    { name: "delay", type: "number", min: 0, max: 3000, step: 50, default: 0, control: false, description: "Ms before the first flip; stagger it across tiles." },
    { name: "width", type: "number", min: 80, max: 400, step: 10, default: 180, control: false, description: "Tile width in px." },
    { name: "height", type: "number", min: 80, max: 520, step: 10, default: 240, control: false, description: "Tile height in px." },
  ],
  usage: `{columns.map((items, i) => (
  <FlipFlow key={i} items={items} delay={i * 160} />
))}`,
} satisfies Meta;
