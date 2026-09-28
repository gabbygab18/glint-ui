import type { Meta } from "../../types";

export default {
  name: "Scrambled Text",
  category: "text-animations",
  description: "Letters near the cursor dissolve into flickering glyphs and settle back into the original text, strongest right under the pointer.",
  props: [
    { name: "text", type: "string", default: "Move your cursor across this paragraph. Every letter it passes dissolves into noise for a moment, then snaps right back into place as if nothing happened.", description: "Text to render." },
    { name: "radius", type: "number", min: 20, max: 300, step: 5, default: 100, description: "Pointer radius that scrambles characters, in px." },
    { name: "duration", type: "number", min: 100, max: 4000, step: 50, default: 1200, description: "How long a character under the pointer keeps scrambling, in ms." },
    { name: "speed", type: "number", min: 16, max: 300, step: 2, default: 50, description: "Ms between glyph swaps." },
    { name: "scrambleChars", type: "string", default: "!<>-_\/[]{}=+*^?#01", description: "Glyphs used while scrambling." },
    { name: "scrambleColor", type: "color", default: "#a3e635", description: "Color of scrambled glyphs." },
  ],
  usage: `<ScrambledText radius={100} className="font-mono text-2xl" />`,
} satisfies Meta;
