import type { Meta } from "../../types";

export default {
  name: "Pixel Transition",
  category: "animations",
  description: "A card that dissolves into a random pixel grid on hover and reassembles as its second face.",
  props: [
    { name: "children", type: "node", description: "Face shown at rest." },
    { name: "back", type: "node", description: "Face revealed on hover, focus or tap." },
    { name: "gridSize", type: "number", min: 4, max: 30, step: 1, default: 12, description: "Pixels per row and column." },
    { name: "pixelColor", type: "color", default: "#c6ff3d", description: "Color of the covering pixels." },
    { name: "duration", type: "number", min: 200, max: 2000, step: 50, default: 700, description: "Total ms for cover + reveal." },
    { name: "label", type: "string", default: "Flip card", description: "Accessible label for the card." },
  ],
  usage: `<PixelTransition className="h-96 w-72" back={<Details />}>\n  <img src="/cover.jpg" alt="" className="size-full object-cover" />\n</PixelTransition>`,
} satisfies Meta;
