import type { Meta } from "../../types";

export default {
  name: "Drift Card",
  category: "components",
  description: "A card whose photo, text and chips drift at different parallax depths as the pointer moves, with a soft tilt and glare.",
  dependencies: ["motion"],
  props: [
    { name: "image", type: "string", control: false, description: "Background image URL." },
    { name: "title", type: "string", default: "Where the fog meets the ridge", description: "Card title." },
    { name: "description", type: "string", default: "A three-day traverse along the northern coast, shot on medium format.", description: "Supporting text." },
    { name: "eyebrow", type: "string", default: "Field notes · 04", description: "Floating chip label." },
    { name: "children", type: "node", description: "Extra foreground content, e.g. a button." },
    { name: "depth", type: "number", min: 0, max: 60, step: 1, default: 24, description: "Max drift of the nearest layer in px." },
    { name: "tilt", type: "number", min: 0, max: 20, step: 1, default: 8, description: "Max tilt in degrees." },
    { name: "width", type: "number", min: 200, max: 480, step: 10, default: 320, description: "Card width in px." },
    { name: "height", type: "number", min: 240, max: 560, step: 10, default: 420, description: "Card height in px." },
  ],
  usage: `<DriftCard image="/ridge.jpg" eyebrow="Field notes" title="Where the fog meets the ridge" description="A three-day traverse." />`,
} satisfies Meta;
