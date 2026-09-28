import type { Meta } from "../../types";

export default {
  name: "Infinite Spiral",
  category: "components",
  description: "Cards wound around an endless 3D helix that keeps turning, and spins faster when you scroll or drag.",
  props: [
    { name: "images", type: "node", description: "Array of image URLs." },
    { name: "count", type: "number", min: 8, max: 60, step: 1, default: 30, description: "Cards on the spiral; images repeat." },
    { name: "radius", type: "number", min: 100, max: 500, step: 10, default: 300, description: "Spiral radius in px." },
    { name: "step", type: "number", min: 10, max: 60, step: 1, default: 30, description: "Degrees between neighbouring cards." },
    { name: "pitch", type: "number", min: 10, max: 80, step: 1, default: 30, description: "Vertical px between neighbouring cards." },
    { name: "cardWidth", type: "number", min: 80, max: 280, step: 5, default: 150, description: "Card width in px." },
    { name: "speed", type: "number", min: -4, max: 4, step: 0.1, default: 0.8, description: "Idle rotation in cards per second." },
  ],
  usage: `<div className="h-[32rem]">
  <InfiniteSpiral images={photos} radius={300} />
</div>`,
} satisfies Meta;
