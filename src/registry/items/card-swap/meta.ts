import type { Meta } from "../../types";

export default {
  name: "Card Swap",
  category: "components",
  description: "A skewed 3D stack of cards that cycles on its own: the front card drops away and springs back in behind the others.",
  dependencies: ["motion"],
  props: [
    { name: "cards", type: "node", description: "Array of card nodes." },
    { name: "width", type: "number", min: 180, max: 480, step: 10, default: 340, description: "Card width in px." },
    { name: "height", type: "number", min: 120, max: 360, step: 10, default: 240, description: "Card height in px." },
    { name: "distanceX", type: "number", min: 0, max: 120, step: 2, default: 56, description: "Horizontal px between cards." },
    { name: "distanceY", type: "number", min: 0, max: 120, step: 2, default: 56, description: "Vertical px between cards." },
    { name: "skew", type: "number", min: -15, max: 15, step: 1, default: 6, description: "Stack skew in degrees." },
    { name: "delay", type: "number", min: 1500, max: 10000, step: 250, default: 3500, description: "Ms between swaps." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Pause while hovered." },
    { name: "easing", type: "select", options: ["elastic", "smooth"], default: "elastic", description: "Motion style." },
  ],
  usage: `<CardSwap cards={[<div key="a">One</div>, <div key="b">Two</div>, <div key="c">Three</div>]} />`,
} satisfies Meta;
