import type { Meta } from "../../types";

export default {
  "name": "Meteors",
  "category": "backgrounds",
  "description": "Shooting stars streak across the container. Pure CSS, SSR-safe.",
  "props": [
    {
      "name": "count",
      "type": "number",
      "min": 1,
      "max": 60,
      "step": 1,
      "default": 20,
      "description": "Number of meteors."
    },
    {
      "name": "color",
      "type": "color",
      "default": "#e4e4e7",
      "description": "Meteor color."
    },
    {
      "name": "angle",
      "type": "number",
      "min": 0,
      "max": 360,
      "step": 5,
      "default": 215,
      "description": "Travel direction in degrees."
    }
  ],
  "usage": "<div className=\"relative h-96 overflow-hidden\">\n  <Meteors />\n</div>"
} satisfies Meta;
