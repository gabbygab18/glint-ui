import type { Meta } from "../../types";

export default {
  name: "Electric Logo",
  category: "animations",
  description: "Pulses of glowing current race along any SVG outline, flickering and arcing as they go.",
  props: [
    { name: "path", type: "string", description: "SVG path data in a 200×200 viewBox. Defaults to a bolt in a hexagon." },
    { name: "size", type: "number", min: 80, max: 420, step: 10, default: 240, description: "Rendered size in px." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Current and glow color." },
    { name: "speed", type: "number", min: 0.1, max: 4, step: 0.1, default: 1, description: "Current speed multiplier." },
    { name: "jitter", type: "number", min: 0, max: 12, step: 0.5, default: 3, description: "Px of electric jitter." },
    { name: "glow", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Glow strength multiplier." },
    { name: "strokeWidth", type: "number", min: 0.5, max: 8, step: 0.5, default: 2.5, description: "Stroke width in viewBox units." },
    { name: "label", type: "string", description: "Accessible name; omit for a decorative logo." },
  ],
  usage: `<ElectricLogo path="M100 18 L171 59 ..." color="#c6ff3d" label="Acme" />`,
} satisfies Meta;
