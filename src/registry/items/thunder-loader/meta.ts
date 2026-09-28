import type { Meta } from "../../types";

export default {
  name: "Thunder Loader",
  category: "micro-interactions",
  description: "A lightning bolt that charges up in stuttering surges while arcs crackle around it, then flashes white, throws sparks and discharges. Pass progress for a determinate meter.",
  isNew: true,
  props: [
    { name: "size", type: "number", min: 24, max: 240, step: 4, default: 96, description: "Px." },
    { name: "color", type: "color", default: "#facc15", description: "Charge color." },
    { name: "speed", type: "number", min: 0.25, max: 3, step: 0.05, default: 1, description: "Cycle speed multiplier." },
    { name: "label", type: "string", default: "Charging", description: "Screen reader text." },
    { name: "progress", type: "node", description: "0-100 to show a determinate charge (role=progressbar). Omit to loop." },
  ],
  usage: `<ThunderLoader size={64} />
<ThunderLoader progress={uploadPct} label="Uploading" />`,
} satisfies Meta;
