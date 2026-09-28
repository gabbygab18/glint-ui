import type { Meta } from "../../types";

export default {
  "name": "Magnet",
  "category": "animations",
  "description": "Pulls its children toward the cursor when it gets close.",
  "props": [
    {
      "name": "children",
      "type": "node",
      "description": "Content to attract."
    },
    {
      "name": "padding",
      "type": "number",
      "min": 0,
      "max": 300,
      "step": 10,
      "default": 80,
      "description": "Extra px around the element where the pull starts."
    },
    {
      "name": "strength",
      "type": "number",
      "min": 1,
      "max": 10,
      "step": 0.5,
      "default": 3,
      "description": "Higher is weaker: offset = distance / strength."
    }
  ],
  "usage": "<Magnet padding={80}>\n  <button>Hover near me</button>\n</Magnet>"
} satisfies Meta;
