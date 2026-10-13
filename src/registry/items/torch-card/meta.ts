import type { Meta } from "../../types";

export default {
  "name": "Torch Card",
  "category": "animations",
  "description": "A soft light follows the cursor across the card surface.",
  "props": [
    {
      "name": "children",
      "type": "node",
      "description": "Card content."
    },
    {
      "name": "spotlightColor",
      "type": "color",
      "default": "rgba(198, 255, 61, 0.18)",
      "description": "Light color; use alpha."
    },
    {
      "name": "size",
      "type": "number",
      "min": 100,
      "max": 1000,
      "step": 20,
      "default": 400,
      "description": "Spotlight diameter in px."
    }
  ],
  "usage": "<TorchCard>\n  <h3>Spotlight</h3>\n</TorchCard>"
} satisfies Meta;
