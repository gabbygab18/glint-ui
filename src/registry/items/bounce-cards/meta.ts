import type { Meta } from "../../types";

export default {
  name: "Bounce Cards",
  category: "components",
  description: "A fanned stack of photo cards that bounce into place when scrolled into view and spread apart on hover.",
  dependencies: ["motion"],
  props: [
    { name: "images", type: "node", description: "Array of image URLs." },
    { name: "cardSize", type: "number", min: 80, max: 260, step: 5, default: 170, description: "Card width in px (height is 1.25x)." },
    { name: "overlap", type: "number", min: 30, max: 220, step: 5, default: 110, description: "Px between card centers." },
    { name: "rotation", type: "number", min: 0, max: 25, step: 1, default: 7, description: "Fan rotation per card in degrees." },
    { name: "spread", type: "number", min: 0, max: 160, step: 5, default: 70, description: "Px neighbours are pushed on hover." },
    { name: "stagger", type: "number", min: 0, max: 0.4, step: 0.02, default: 0.08, description: "Seconds between card entrances." },
    { name: "bounciness", type: "number", min: 4, max: 30, step: 1, default: 9, description: "Entrance spring damping (lower = bouncier)." },
  ],
  usage: `<BounceCards images={["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"]} />`,
} satisfies Meta;
