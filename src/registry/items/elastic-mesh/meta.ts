import type { Meta } from "../../types";

export default {
  name: "Elastic Mesh",
  category: "animations",
  description: "A wireframe mesh that stretches around the cursor like cloth and springs back; click to send a shockwave.",
  props: [
    { name: "spacing", type: "number", min: 12, max: 80, step: 2, default: 34, description: "Px between mesh points." },
    { name: "radius", type: "number", min: 40, max: 400, step: 10, default: 170, description: "Px radius the cursor bends." },
    { name: "strength", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Cursor force multiplier." },
    { name: "stiffness", type: "number", min: 0.005, max: 0.3, step: 0.005, default: 0.05, description: "Pull back toward rest. Higher = snappier." },
    { name: "damping", type: "number", min: 0.5, max: 0.98, step: 0.01, default: 0.88, description: "Velocity kept per frame. Higher = wobblier." },
    { name: "mode", type: "select", options: ["push", "pull"], default: "push", description: "Push the mesh away from the cursor or pull it in." },
    { name: "lineColor", type: "color", default: "#34343c", description: "Idle line color." },
    { name: "activeColor", type: "color", default: "#c6ff3d", description: "Color of stretched lines." },
  ],
  usage: `<div className="relative h-96">
  <ElasticMesh spacing={34} />
</div>`,
} satisfies Meta;
