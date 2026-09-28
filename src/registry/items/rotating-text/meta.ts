import type { Meta } from "../../types";

export default {
  "name": "Rotating Text",
  "category": "text-animations",
  "description": "Cycles through a list of words with a vertical slide.",
  "props": [
    {
      "name": "words",
      "type": "list",
      "default": [
        "faster",
        "smoother",
        "bolder"
      ],
      "description": "Words to cycle through."
    },
    {
      "name": "interval",
      "type": "number",
      "min": 500,
      "max": 5000,
      "step": 100,
      "default": 2000,
      "description": "Ms each word stays on screen."
    }
  ],
  "usage": "<p>Ship <RotatingText words={[\"faster\", \"smoother\", \"bolder\"]} /></p>"
} satisfies Meta;
