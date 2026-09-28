import type { Meta } from "../../types";

export default {
  name: "Text Cursor",
  category: "text-animations",
  description: "A trail of glyphs or emoji that spills from the pointer inside its container, spinning and fading as it drifts.",
  props: [
    { name: "items", type: "list", default: ["✦", "✧", "✶", "⋆"], description: "Glyphs or emoji, used in order." },
    { name: "colors", type: "list", default: ["#bef264", "#67e8f9", "#f0abfc"], description: "Colors cycled per glyph." },
    { name: "spacing", type: "number", min: 6, max: 100, step: 1, default: 22, description: "Px of pointer travel between glyphs." },
    { name: "lifetime", type: "number", min: 200, max: 3000, step: 50, default: 1000, description: "Ms each glyph lives." },
    { name: "size", type: "number", min: 8, max: 64, step: 1, default: 30, description: "Glyph size in px." },
    { name: "spin", type: "number", min: 0, max: 720, step: 10, default: 180, description: "Degrees each glyph spins." },
    { name: "maxItems", type: "number", min: 5, max: 200, step: 5, default: 60, description: "Most glyphs alive at once." },
    { name: "children", type: "node", description: "Content the trail plays over." },
  ],
  usage: `<TextCursor items={["🍋", "✨"]} className="h-96">
  <h2>Leave a trail</h2>
</TextCursor>`,
} satisfies Meta;
