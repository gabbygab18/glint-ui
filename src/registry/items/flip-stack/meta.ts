import type { Meta } from "../../types";

export default {
  name: "Flip Stack",
  category: "components",
  description: "A pile of cards where clicking tosses the top card up, flips it end over end and drops it behind the pile as the rest step forward.",
  dependencies: ["motion"],
  props: [
    { name: "cards", type: "node", description: "Array of card faces, top first." },
    { name: "back", type: "node", description: "Shared back face shown mid-flip." },
    { name: "offset", type: "number", min: 0, max: 40, step: 1, default: 16, description: "Px each card behind peeks out." },
    { name: "scaleStep", type: "number", min: 0, max: 0.15, step: 0.01, default: 0.06, description: "Scale lost per card of depth." },
    { name: "visible", type: "number", min: 1, max: 5, step: 1, default: 3, description: "Cards visible in the pile." },
    { name: "lift", type: "number", min: 0, max: 1, step: 0.05, default: 0.4, description: "Toss height as a fraction of card height." },
    { name: "duration", type: "number", min: 0.3, max: 2, step: 0.05, default: 0.9, description: "Seconds per flip." },
    { name: "width", type: "number", min: 140, max: 420, step: 10, default: 240, description: "Card width in px." },
    { name: "height", type: "number", min: 160, max: 520, step: 10, default: 300, description: "Card height in px." },
    { name: "label", type: "string", control: false, description: "Accessible name for the stack." },
    { name: "onChange", type: "node", description: "Called with the index of the new top card." },
  ],
  usage: `<FlipStack
  cards={photos.map((src) => <img src={src} alt="" className="size-full object-cover" />)}
  back={<CardBack />}
/>`,
} satisfies Meta;
