import type { Meta } from "../../types";

export default {
  "name": "Glow Border",
  "category": "animations",
  "description": "A comet of light orbits the element's border.",
  "props": [
    {
      "name": "children",
      "type": "node",
      "description": "Content inside the border."
    },
    {
      "name": "color",
      "type": "color",
      "default": "#c6ff3d",
      "description": "Glow color."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 1,
      "max": 20,
      "step": 0.5,
      "default": 4,
      "description": "Seconds per rotation."
    },
    {
      "name": "thickness",
      "type": "number",
      "min": 1,
      "max": 6,
      "step": 1,
      "default": 1,
      "description": "Border width in px."
    },
    {
      "name": "radius",
      "type": "number",
      "min": 0,
      "max": 40,
      "step": 1,
      "default": 16,
      "description": "Corner radius in px."
    },
    {
      "name": "background",
      "type": "color",
      "default": "#0a0a0a",
      "description": "Inner fill."
    }
  ],
  "usage": "<GlowBorder>\n  <button className=\"px-6 py-3\">Get started</button>\n</GlowBorder>"
} satisfies Meta;
