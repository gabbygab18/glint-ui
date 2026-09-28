import type { Meta } from "../../types";

export default {
  "name": "Gradient Text",
  "category": "text-animations",
  "description": "Text filled with a slowly flowing multi-stop gradient.",
  "props": [
    {
      "name": "text",
      "type": "string",
      "default": "Gradient text",
      "description": "Text to render."
    },
    {
      "name": "colors",
      "type": "list",
      "default": [
        "#c6ff3d",
        "#22d3ee",
        "#a78bfa",
        "#c6ff3d"
      ],
      "description": "Gradient stops. Repeat the first color last for a seamless loop."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 1,
      "max": 20,
      "step": 1,
      "default": 6,
      "description": "Seconds per cycle."
    }
  ],
  "usage": "<GradientText text=\"Gradient text\" colors={[\"#c6ff3d\", \"#22d3ee\", \"#c6ff3d\"]} />"
} satisfies Meta;
