import type { Meta } from "../../types";

export default {
  name: "Decay Card",
  category: "components",
  description: "An image card that leans toward the cursor and melts into noisy SVG displacement the faster you move.",
  props: [
    { name: "image", type: "string", default: "", control: false, description: "Image URL." },
    { name: "width", type: "number", min: 160, max: 480, step: 10, default: 300, description: "Card width in px." },
    { name: "height", type: "number", min: 200, max: 600, step: 10, default: 400, description: "Card height in px." },
    { name: "intensity", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Displacement strength." },
    { name: "frequency", type: "number", min: 0.002, max: 0.05, step: 0.001, default: 0.012, description: "Noise frequency (lower = bigger blobs)." },
    { name: "drift", type: "number", min: 0, max: 60, step: 1, default: 18, description: "Px the card drifts toward the cursor." },
    { name: "alt", type: "string", default: "", control: false, description: "Image alt text." },
    { name: "children", type: "node", description: "Overlay content, e.g. a caption." },
  ],
  usage: `<DecayCard image="/portrait.jpg" alt="Portrait">
  <p className="text-4xl font-semibold">Decay</p>
</DecayCard>`,
} satisfies Meta;
