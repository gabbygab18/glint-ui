import type { Meta } from "../../types";

export default {
  name: "Glow Cursor",
  category: "animations",
  description: "A soft colored glow trails the cursor inside its container and swells over interactive children.",
  props: [
    { name: "children", type: "node", description: "Content the glow sits behind." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Glow color." },
    { name: "size", type: "number", min: 100, max: 800, step: 10, default: 360, description: "Glow diameter in px." },
    { name: "ease", type: "number", min: 0.02, max: 1, step: 0.01, default: 0.12, description: "Follow easing per frame; lower trails further." },
    { name: "intensity", type: "number", min: 0.05, max: 1, step: 0.05, default: 0.35, description: "Resting opacity." },
    { name: "hoverScale", type: "number", min: 1, max: 3, step: 0.1, default: 1.5, description: "Scale over interactive children." },
    { name: "selector", type: "string", default: "a,button,[data-glow]", description: "Children that make the glow brighten." },
  ],
  usage: `<GlowCursor className="rounded-3xl border p-10">
  <button>Hover me</button>
</GlowCursor>`,
} satisfies Meta;
