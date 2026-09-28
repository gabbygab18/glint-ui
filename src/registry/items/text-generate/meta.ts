import type { Meta } from "../../types";

export default {
  name: "Text Generate",
  category: "text-animations",
  description: "Words stream in one by one out of a soft blur, like a model typing its answer, with an optional glowing caret.",
  props: [
    {
      name: "text",
      type: "string",
      default:
        "Sure! Here is a calm, focused plan for your launch week: ship the smallest thing that works, listen closely to the first ten users, and polish only what they actually touch.",
      description: "Text to stream in.",
    },
    { name: "stagger", type: "number", min: 20, max: 400, step: 10, default: 70, description: "Delay between words, in ms." },
    { name: "duration", type: "number", min: 100, max: 2000, step: 50, default: 700, description: "Fade/unblur duration of each word, in ms." },
    { name: "blur", type: "number", min: 0, max: 24, step: 1, default: 10, description: "Starting blur of each word, in px." },
    { name: "caret", type: "boolean", default: true, description: "Show a caret that follows the stream and blinks when done." },
    { name: "caretColor", type: "color", default: "#a3e635", description: "Caret color." },
  ],
  usage: `<TextGenerate text="Here is a calm, focused plan for your launch week…" stagger={70} />`,
} satisfies Meta;
