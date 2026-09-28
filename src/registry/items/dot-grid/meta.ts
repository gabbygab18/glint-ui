import type { Meta } from "../../types";

export default {
  "name": "Dot Grid",
  "category": "backgrounds",
  "description": "A calm dot matrix that lights up around the cursor. Redraws only on movement.",
  "props": [
    {
      "name": "gap",
      "type": "number",
      "min": 8,
      "max": 64,
      "step": 2,
      "default": 24,
      "description": "Px between dots."
    },
    {
      "name": "dotSize",
      "type": "number",
      "min": 0.5,
      "max": 6,
      "step": 0.5,
      "default": 2,
      "description": "Dot radius in px."
    },
    {
      "name": "baseColor",
      "type": "color",
      "default": "#3f3f46",
      "description": "Idle dot color."
    },
    {
      "name": "activeColor",
      "type": "color",
      "default": "#c6ff3d",
      "description": "Dot color near the cursor."
    },
    {
      "name": "proximity",
      "type": "number",
      "min": 20,
      "max": 400,
      "step": 10,
      "default": 120,
      "description": "Px radius that lights up."
    }
  ],
  "usage": "<div className=\"relative h-96\">\n  <DotGrid />\n</div>"
} satisfies Meta;
