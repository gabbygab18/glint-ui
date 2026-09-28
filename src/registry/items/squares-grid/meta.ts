import type { Meta } from "../../types";

export default {
  "name": "Squares Grid",
  "category": "backgrounds",
  "description": "An endlessly scrolling grid; the square under the cursor fills in.",
  "isNew": true,
  "props": [
    {
      "name": "squareSize",
      "type": "number",
      "min": 10,
      "max": 120,
      "step": 2,
      "default": 40,
      "description": "Px per square."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 0,
      "max": 3,
      "step": 0.1,
      "default": 0.5,
      "description": "Px per frame; 0 holds still."
    },
    {
      "name": "direction",
      "type": "select",
      "options": [
        "diagonal",
        "up",
        "down",
        "left",
        "right"
      ],
      "default": "diagonal",
      "description": "Scroll direction."
    },
    {
      "name": "borderColor",
      "type": "color",
      "default": "#27272a",
      "description": "Grid line color."
    },
    {
      "name": "hoverFill",
      "type": "color",
      "default": "#1f2a12",
      "description": "Fill of the hovered square."
    }
  ],
  "usage": "<div className=\"relative h-96\">\n  <SquaresGrid direction=\"diagonal\" />\n</div>"
} satisfies Meta;
