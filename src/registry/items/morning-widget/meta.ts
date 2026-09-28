import type { Meta } from "../../types";

export default {
  name: "Morning Widget",
  category: "widgets",
  description: "A squircle card on a drifting sunrise mesh that greets you by name, rolls a live clock digit by digit and rotates motivational lines.",
  isNew: true,
  dependencies: ["motion", "lucide-react", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "name", type: "string", default: "Friend", description: "Name the greeting is addressed to." },
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Mesh palette." },
    { name: "showClock", type: "boolean", default: true, description: "Show the live clock." },
    { name: "timeFormat", type: "select", options: ["12h", "24h"], default: "12h", description: "Clock format." },
    { name: "interval", type: "number", min: 0, max: 30, step: 1, default: 9, description: "Seconds each line stays up; 0 holds it. Hover or focus also holds it." },
    { name: "tilt", type: "boolean", default: true, description: "Lean the card towards the pointer." },
    { name: "quotes", type: "node", description: "`{ text, emphasis?: string[] }[]`. Emphasis phrases are matched literally. Ships with five lines." },
  ],
  usage: `<MorningWidget name="Gab" variant="calamansi" />`,
} satisfies Meta;
