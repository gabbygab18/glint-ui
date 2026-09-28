import type { Meta } from "../../types";

export default {
  name: "Card Flip",
  category: "components",
  description: "A 3D card that springs over to reveal its back on hover or click, with Enter/Space to toggle.",
  props: [
    { name: "front", type: "node", description: "Front face content." },
    { name: "back", type: "node", description: "Back face content." },
    { name: "trigger", type: "select", options: ["hover", "click"], default: "hover", description: "What flips the card." },
    { name: "direction", type: "select", options: ["horizontal", "vertical"], default: "horizontal", description: "Flip axis." },
    { name: "duration", type: "number", min: 200, max: 2000, step: 50, default: 700, description: "Flip duration in ms." },
    { name: "width", type: "number", min: 160, max: 480, step: 10, default: 280, description: "Card width in px." },
    { name: "height", type: "number", min: 160, max: 560, step: 10, default: 380, description: "Card height in px." },
    { name: "label", type: "string", control: false, description: "Accessible name; defaults to the visible face text." },
  ],
  usage: `<CardFlip
  front={<img src="/kyoto.jpg" alt="Kyoto" />}
  back={<TripDetails />}
  trigger="click"
/>`,
} satisfies Meta;
