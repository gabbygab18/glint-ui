import type { Meta } from "../../types";

export default {
  name: "Gradual Blur",
  category: "animations",
  description: "A progressive edge blur built from stacked, masked backdrop-filter layers. Drop it over any scrolling area.",
  props: [
    { name: "position", type: "select", options: ["top", "bottom", "left", "right"], default: "bottom", description: "Edge the blur is anchored to." },
    { name: "strength", type: "number", min: 1, max: 48, step: 1, default: 12, description: "Blur in px at the edge." },
    { name: "height", type: "number", min: 40, max: 400, step: 10, default: 140, description: "Band thickness in px." },
    { name: "layers", type: "number", min: 1, max: 12, step: 1, default: 6, description: "Stacked layers; more is smoother." },
    { name: "exponential", type: "boolean", default: true, description: "Exponential blur ramp instead of linear." },
    { name: "fade", type: "boolean", default: true, description: "Also fade toward the background color." },
  ],
  usage: `<div className="relative h-96 overflow-hidden">
  <div className="h-full overflow-y-auto">{/* content */}</div>
  <GradualBlur position="bottom" strength={12} height={140} />
</div>`,
} satisfies Meta;
