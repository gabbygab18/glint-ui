import type { Meta } from "../../types";

export default {
  name: "Lustre Text",
  category: "text-animations",
  description: "Polished metal lettering with a bevel and a specular glint that sweeps across, or follows your pointer.",
  props: [
    { name: "text", type: "string", default: "Chrome Finish", description: "Text to render." },
    { name: "metal", type: "select", options: ["silver", "gold", "rose", "titanium"], default: "silver", description: "Metal finish." },
    { name: "speed", type: "number", min: 1, max: 12, step: 0.5, default: 4, description: "Seconds per lustre sweep (includes a short rest)." },
    { name: "followPointer", type: "boolean", default: true, description: "Highlight follows the pointer while hovered." },
    { name: "bevel", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Strength of the bevel shading, 0–1." },
  ],
  usage: `<LustreText text="Chrome Finish" metal="silver" />`,
} satisfies Meta;
