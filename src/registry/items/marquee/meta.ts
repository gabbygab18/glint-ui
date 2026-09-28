import type { Meta } from "../../types";

export default {
  "name": "Marquee",
  "category": "animations",
  "description": "Infinite horizontal scroller for logos, testimonials or anything else.",
  "props": [
    {
      "name": "items",
      "type": "node",
      "description": "Array of nodes to loop."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 5,
      "max": 80,
      "step": 1,
      "default": 20,
      "description": "Seconds per loop."
    },
    {
      "name": "direction",
      "type": "select",
      "options": [
        "left",
        "right"
      ],
      "default": "left",
      "description": "Scroll direction."
    },
    {
      "name": "pauseOnHover",
      "type": "boolean",
      "default": true,
      "description": "Pause while hovered."
    },
    {
      "name": "gap",
      "type": "number",
      "min": 0,
      "max": 160,
      "step": 4,
      "default": 48,
      "description": "Px between items."
    },
    {
      "name": "fadeEdges",
      "type": "boolean",
      "default": true,
      "description": "Fade out both edges."
    }
  ],
  "usage": "<Marquee items={logos.map((l) => <img key={l.name} src={l.src} alt={l.name} />)} />"
} satisfies Meta;
