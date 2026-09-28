import type { Meta } from "../../types";

export default {
  name: "Glass Surface",
  category: "components",
  description: "A liquid-glass panel whose rim bends the backdrop through an SVG displacement map, with chromatic fringes, blur and a specular edge.",
  dependencies: ["react-use-measure"],
  props: [
    { name: "children", type: "node", description: "Panel content." },
    { name: "radius", type: "number", min: 0, max: 80, step: 1, default: 28, description: "Corner radius in px." },
    { name: "bezel", type: "number", min: 4, max: 80, step: 1, default: 26, description: "Width of the refracting rim in px." },
    { name: "refraction", type: "number", min: 0, max: 200, step: 5, default: 70, description: "Strength of the rim refraction in px." },
    { name: "aberration", type: "number", min: 0, max: 20, step: 1, default: 3, description: "Px of chromatic split at the rim." },
    { name: "blur", type: "number", min: 0, max: 24, step: 0.5, default: 2, description: "Backdrop blur in px." },
    { name: "saturation", type: "number", min: 0.5, max: 3, step: 0.1, default: 1.6, description: "Backdrop saturation multiplier." },
    { name: "tint", type: "number", min: 0, max: 0.5, step: 0.01, default: 0.06, description: "Opacity of the white tint." },
  ],
  usage: `<GlassSurface className="w-80 p-6" radius={28}>
  <p>Now playing</p>
</GlassSurface>`,
} satisfies Meta;
