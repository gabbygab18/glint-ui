import type { Meta } from "../../types";

export default {
  name: "Fuzzy Text",
  category: "text-animations",
  description: "Canvas-drawn lettering whose pixel rows jitter sideways like a weak signal, getting noisier when you hover it.",
  props: [
    { name: "text", type: "string", default: "FUZZY", description: "Text to draw." },
    { name: "fontSize", type: "string", default: "clamp(4rem, 15vw, 10rem)", description: "Any CSS font-size; resolved to px for the canvas." },
    { name: "fontWeight", type: "number", min: 100, max: 900, step: 100, default: 900, description: "Font weight." },
    { name: "color", type: "color", default: "#fafafa", description: "Text color." },
    { name: "baseIntensity", type: "number", min: 0, max: 1, step: 0.01, default: 0.18, description: "Jitter at rest." },
    { name: "hoverIntensity", type: "number", min: 0, max: 1, step: 0.01, default: 0.55, description: "Jitter while hovered." },
    { name: "fuzzRange", type: "number", min: 0, max: 100, step: 1, default: 30, description: "Maximum sideways shift of a row, in px." },
    { name: "enableHover", type: "boolean", default: true, description: "Ramp up the jitter on hover." },
  ],
  usage: `<FuzzyText text="404" baseIntensity={0.2} hoverIntensity={0.6} />`,
} satisfies Meta;
