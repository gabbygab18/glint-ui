import type { Meta } from "../../types";

export default {
  name: "Lean Card",
  category: "components",
  description: "A card that leans and drifts toward the pointer while its shadow slides away and the content counter-leans for depth.",
  props: [
    { name: "children", type: "node", description: "Card content." },
    { name: "lean", type: "number", min: 0, max: 20, step: 0.5, default: 7, description: "Max lean in degrees." },
    { name: "drift", type: "number", min: 0, max: 30, step: 1, default: 10, description: "Px the card drifts toward the pointer." },
    { name: "counter", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "How much the content leans back." },
    { name: "shadowShift", type: "number", min: 0, max: 60, step: 1, default: 22, description: "Px the shadow slides away from the pointer." },
    { name: "stiffness", type: "number", min: 2, max: 30, step: 1, default: 9, description: "Follow speed." },
    { name: "glare", type: "boolean", default: true, description: "Soft light that follows the pointer." },
  ],
  usage: `<LeanCard className="w-64">
  <img src="/cover.jpg" alt="" />
  <h3>Title</h3>
</LeanCard>`,
} satisfies Meta;
