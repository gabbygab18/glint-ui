import type { Meta } from "../../types";

export default {
  "name": "Animated List",
  "category": "components",
  "description": "Items drop in one at a time, like a live notification feed.",
  "props": [
    {
      "name": "items",
      "type": "node",
      "description": "Array of nodes to cycle through."
    },
    {
      "name": "delay",
      "type": "number",
      "min": 300,
      "max": 5000,
      "step": 100,
      "default": 1200,
      "description": "Ms between new items."
    },
    {
      "name": "max",
      "type": "number",
      "min": 1,
      "max": 10,
      "step": 1,
      "default": 4,
      "description": "Max items visible."
    }
  ],
  "usage": "<AnimatedList items={notifications.map((n) => <Notification key={n.id} {...n} />)} />"
} satisfies Meta;
