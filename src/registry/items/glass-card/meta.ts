import type { Meta } from "../../types";

export default {
  name: "Glass Card",
  category: "components",
  description: "Frosted glassmorphism card with a refractive edge light, film grain and a pointer-follow sheen.",
  props: [
    { name: "children", type: "node", description: "Card content." },
    { name: "blur", type: "number", min: 0, max: 40, step: 1, default: 18, description: "Backdrop blur in px." },
    { name: "tint", type: "number", min: 0, max: 0.4, step: 0.01, default: 0.1, description: "White tint of the glass." },
    { name: "noise", type: "number", min: 0, max: 1, step: 0.05, default: 0.25, description: "Film grain strength." },
    { name: "radius", type: "number", min: 0, max: 48, step: 1, default: 28, description: "Corner radius in px." },
    { name: "highlight", type: "boolean", default: true, description: "Pointer-follow sheen and edge light." },
  ],
  usage: `<div className="relative bg-gradient-to-br from-rose-500 to-violet-600 p-16">
  <GlassCard className="w-80">
    <div className="p-6">Frosted content</div>
  </GlassCard>
</div>`,
} satisfies Meta;
