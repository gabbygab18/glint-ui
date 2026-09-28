import type { Meta } from "../../types";

export default {
  name: "ASCII Text",
  category: "text-animations",
  description: "Text rasterized into shimmering ASCII glyphs on a canvas, rippling in a slow wave and bulging under the pointer like a lens.",
  props: [
    { name: "text", type: "string", default: "ASCII", description: "Text to rasterize." },
    { name: "cellSize", type: "number", min: 6, max: 24, step: 1, default: 11, description: "Height of one character cell, in px." },
    { name: "charset", type: "string", default: " .:-=+*#%@", description: "Glyphs ordered from sparse to dense." },
    { name: "color", type: "color", default: "#bef264", description: "First gradient color." },
    { name: "secondaryColor", type: "color", default: "#22d3ee", description: "Second gradient color." },
    { name: "waveAmplitude", type: "number", min: 0, max: 30, step: 1, default: 6, description: "Horizontal wave distortion, in px." },
    { name: "waveSpeed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Wave speed multiplier." },
    { name: "pointerRadius", type: "number", min: 0, max: 400, step: 10, default: 150, description: "Radius of the pointer lens, in px. 0 disables it." },
  ],
  usage: `<div className="relative h-80">
  <AsciiText text="ASCII" cellSize={11} />
</div>`,
} satisfies Meta;
