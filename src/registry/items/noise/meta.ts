import type { Meta } from "../../types";

export default {
  name: "Noise",
  category: "animations",
  description: "An animated film-grain overlay. Pre-baked canvas frames, so it costs almost nothing to run.",
  props: [
    { name: "opacity", type: "number", min: 0, max: 1, step: 0.01, default: 0.14, description: "Grain opacity." },
    { name: "size", type: "number", min: 1, max: 6, step: 0.5, default: 1.5, description: "Grain size in px." },
    { name: "refreshRate", type: "number", min: 0, max: 60, step: 1, default: 24, description: "Grain frames per second (0 = static)." },
    { name: "blendMode", type: "select", options: ["normal", "overlay", "soft-light", "screen", "multiply"], default: "normal", description: "Blend mode against the content below." },
  ],
  usage: `<div className="relative">
  {/* content */}
  <Noise opacity={0.14} />
</div>`,
} satisfies Meta;
