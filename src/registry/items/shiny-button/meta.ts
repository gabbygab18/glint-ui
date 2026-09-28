import type { Meta } from "../../types";

export default {
  "name": "Shiny Button",
  "category": "buttons",
  "description": "Gradient border and inner glow that follow the cursor.",
  "props": [
    {
      "name": "children",
      "type": "node",
      "description": "Button label."
    },
    {
      "name": "gradientFrom",
      "type": "color",
      "default": "#c6ff3d",
      "description": "Gradient start."
    },
    {
      "name": "gradientTo",
      "type": "color",
      "default": "#22d3ee",
      "description": "Gradient end."
    },
    {
      "name": "size",
      "type": "select",
      "options": [
        "sm",
        "md",
        "lg"
      ],
      "default": "md",
      "description": "Button size."
    }
  ],
  "usage": "<ShinyButton size=\"lg\">Get started</ShinyButton>"
} satisfies Meta;
