import type { Meta } from "../../types";

export default {
  name: "Ferrofluid",
  category: "backgrounds",
  description: "A glossy black ferrofluid blob whose spikes rise toward the cursor like it is chasing a magnet.",
  props: [
    { name: "color", type: "color", default: "#7c6cff", description: "Rim light and glow color." },
    { name: "spikes", type: "number", min: 8, max: 64, step: 1, default: 28, description: "Number of spikes." },
    { name: "spikeLength", type: "number", min: 0, max: 2, step: 0.05, default: 1, description: "Spike length multiplier." },
    { name: "size", type: "number", min: 0.4, max: 2, step: 0.05, default: 1, description: "Blob size." },
    { name: "speed", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Animation speed." },
  ],
  usage: `<div className="relative h-96">
  <Ferrofluid color="#7c6cff" spikes={28} />
</div>`,
} satisfies Meta;
