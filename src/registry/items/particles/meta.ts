import type { Meta } from "../../types";

export default {
  "name": "Particles",
  "category": "backgrounds",
  "description": "A drifting constellation that links nearby points and flees the cursor.",
  "props": [
    {
      "name": "count",
      "type": "number",
      "min": 10,
      "max": 300,
      "step": 10,
      "default": 80,
      "description": "Number of particles."
    },
    {
      "name": "color",
      "type": "color",
      "default": "#ffffff",
      "description": "Particle and link color."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 0,
      "max": 3,
      "step": 0.1,
      "default": 0.4,
      "description": "Px per frame."
    },
    {
      "name": "linkDistance",
      "type": "number",
      "min": 0,
      "max": 250,
      "step": 10,
      "default": 110,
      "description": "Max px between linked particles."
    },
    {
      "name": "interactive",
      "type": "boolean",
      "default": true,
      "description": "Particles flee the cursor."
    }
  ],
  "usage": "<div className=\"relative h-96\">\n  <Particles count={100} />\n</div>"
} satisfies Meta;
