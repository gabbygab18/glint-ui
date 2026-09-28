import type { Meta } from "../../types";

export default {
  "name": "Shiny Text",
  "category": "text-animations",
  "description": "A soft highlight sweeps across the text on a loop.",
  "props": [
    {
      "name": "text",
      "type": "string",
      "default": "Shiny text effect",
      "description": "Text to render."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 0.5,
      "max": 10,
      "step": 0.5,
      "default": 3,
      "description": "Seconds per sweep."
    },
    {
      "name": "color",
      "type": "color",
      "default": "#8a8a8a",
      "description": "Base text color."
    },
    {
      "name": "shineColor",
      "type": "color",
      "default": "#ffffff",
      "description": "Highlight color."
    }
  ],
  "usage": "<ShinyText text=\"Shiny text effect\" speed={3} />"
} satisfies Meta;
