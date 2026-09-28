import type { Meta } from "../../types";

export default {
  "name": "Aurora",
  "category": "backgrounds",
  "description": "Slow drifting color blobs, blurred into a northern-lights glow. Pure CSS.",
  "props": [
    {
      "name": "colors",
      "type": "list",
      "default": [
        "#c6ff3d",
        "#22d3ee",
        "#a78bfa"
      ],
      "description": "Three blob colors."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 4,
      "max": 40,
      "step": 1,
      "default": 14,
      "description": "Seconds per drift cycle."
    },
    {
      "name": "blur",
      "type": "number",
      "min": 20,
      "max": 200,
      "step": 5,
      "default": 90,
      "description": "Blur radius in px."
    },
    {
      "name": "opacity",
      "type": "number",
      "min": 0.1,
      "max": 1,
      "step": 0.05,
      "default": 0.55,
      "description": "Blob opacity."
    }
  ],
  "usage": "<div className=\"relative h-96\">\n  <Aurora />\n</div>"
} satisfies Meta;
