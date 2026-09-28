import type { Meta } from "../../types";

export default {
  "name": "Glitch Text",
  "category": "text-animations",
  "description": "RGB-split slices jitter across the text like a broken signal.",
  "isNew": true,
  "props": [
    {
      "name": "text",
      "type": "string",
      "default": "SIGNAL LOST",
      "description": "Text to render."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 0.1,
      "max": 3,
      "step": 0.1,
      "default": 0.6,
      "description": "Seconds per glitch loop."
    },
    {
      "name": "hoverOnly",
      "type": "boolean",
      "default": false,
      "description": "Only glitch while hovered."
    }
  ],
  "usage": "<GlitchText text=\"SIGNAL LOST\" className=\"text-6xl font-black\" />"
} satisfies Meta;
