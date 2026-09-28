import type { Meta } from "../../types";

export default {
  name: "Hyperspeed",
  category: "backgrounds",
  description: "A night highway of light trails rushing toward you. Hold the pointer down to punch it into warp.",
  props: [
    { name: "leftColor", type: "color", default: "#ff2d78", description: "Oncoming light trails." },
    { name: "rightColor", type: "color", default: "#3ee0ff", description: "Outgoing light trails." },
    { name: "sideColor", type: "color", default: "#c9c3ff", description: "Lane markings and roadside posts." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Cruise speed." },
    { name: "boost", type: "number", min: 1, max: 10, step: 0.5, default: 4, description: "Speed multiplier while the pointer is held." },
    { name: "density", type: "number", min: 0.1, max: 1, step: 0.05, default: 0.6, description: "How busy the lanes are." },
  ],
  usage: `<div className="relative h-96">
  <Hyperspeed boost={4} />
</div>`,
} satisfies Meta;
