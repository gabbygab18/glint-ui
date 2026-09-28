import type { Meta } from "../../types";

export default {
  name: "Magnet Lines",
  category: "animations",
  description: "A field of short lines that swing to point at the cursor like iron filings, glowing and stretching as it nears.",
  props: [
    { name: "gap", type: "number", min: 12, max: 80, step: 2, default: 30, description: "Px between line centers." },
    { name: "lineLength", type: "number", min: 4, max: 60, step: 1, default: 16, description: "Line length in px." },
    { name: "lineWidth", type: "number", min: 0.5, max: 6, step: 0.5, default: 2, description: "Line thickness in px." },
    { name: "color", type: "color", default: "#3f3f46", description: "Idle line color." },
    { name: "activeColor", type: "color", default: "#c6ff3d", description: "Color near the cursor." },
    { name: "radius", type: "number", min: 40, max: 600, step: 10, default: 220, description: "Px radius that lights up." },
  ],
  usage: `<div className="relative h-96">
  <MagnetLines gap={30} />
</div>`,
} satisfies Meta;
