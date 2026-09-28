import type { Meta } from "../../types";

export default {
  name: "Letter Glitch",
  category: "backgrounds",
  description: "A full grid of monospace glyphs that keep swapping characters and colors, framed by a soft vignette. Canvas 2D.",
  props: [
    { name: "colors", type: "list", default: ["#1f3b2f", "#4ade80", "#38bdf8", "#a78bfa"], description: "Palette the glyphs flicker between (hex)." },
    { name: "background", type: "color", default: "#05070a", description: "Background and vignette color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Glitch rate multiplier." },
    { name: "fontSize", type: "number", min: 8, max: 40, step: 1, default: 16, description: "Glyph size in px." },
    { name: "characters", type: "string", default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}/\\=+?;:", description: "Characters to pick from." },
    { name: "smooth", type: "boolean", default: true, description: "Fade colors instead of snapping." },
    { name: "vignette", type: "boolean", default: true, description: "Darken the edges." },
  ],
  usage: `<div className="relative h-96">
  <LetterGlitch colors={["#1f3b2f", "#4ade80", "#38bdf8"]} />
</div>`,
} satisfies Meta;
