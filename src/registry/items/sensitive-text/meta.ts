import type { Meta } from "../../types";

export default {
  name: "Sensitive Text",
  category: "text-animations",
  description: "Spoiler text veiled by blur and shimmering noise particles until you hover, focus or click it.",
  props: [
    { name: "children", type: "node", description: "The hidden content." },
    { name: "revealOn", type: "select", options: ["hover", "click"], default: "hover", description: "Reveal while hovered/focused, or toggle on click/Enter/Space." },
    { name: "blur", type: "number", min: 0, max: 20, step: 1, default: 8, description: "Blur applied to the hidden text, in px." },
    { name: "density", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Particle density multiplier for the noise veil." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Particle drift speed multiplier." },
    { name: "label", type: "string", default: "Hidden text, activate to reveal", description: "Accessible label for the hidden state.", control: false },
  ],
  usage: `<p>The killer was <SensitiveText>the butler</SensitiveText> all along.</p>`,
} satisfies Meta;
