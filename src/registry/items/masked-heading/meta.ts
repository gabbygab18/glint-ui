import type { Meta } from "../../types";

export default {
  name: "Masked Heading",
  category: "text-animations",
  description: "A big heading wiped into view by a feathered mask sweep, with a gradient or photo flowing through the letters.",
  props: [
    { name: "text", type: "string", default: "Made to be seen", description: "Heading text." },
    { name: "colors", type: "list", default: ["#bef264", "#22d3ee", "#a78bfa", "#f472b6"], description: "Gradient stops flowing through the letters." },
    { name: "image", type: "string", default: "", description: "Image URL to fill the letters with instead of the gradient." },
    { name: "revealDuration", type: "number", min: 0.3, max: 5, step: 0.1, default: 1.8, description: "Seconds for the reveal sweep." },
    { name: "flowDuration", type: "number", min: 1, max: 20, step: 0.5, default: 6, description: "Seconds per gradient or image-pan cycle." },
    { name: "trigger", type: "select", options: ["view", "loop"], default: "view", description: "Reveal once on view, or sweep in and out forever." },
    { name: "outline", type: "boolean", default: true, description: "Faint ghost of the letters before they are revealed." },
    { name: "as", type: "select", options: ["h1", "h2", "h3", "p", "span", "div"], default: "h2", description: "Element to render.", control: false },
  ],
  usage: `<MaskedHeading text="Made to be seen" colors={["#bef264", "#22d3ee", "#a78bfa"]} />`,
} satisfies Meta;
