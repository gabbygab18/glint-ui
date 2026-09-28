import type { Meta } from "../../types";

export default {
  "name": "Count Up",
  "category": "text-animations",
  "description": "Animates a number from one value to another when it enters the viewport.",
  "props": [
    {
      "name": "to",
      "type": "number",
      "min": 0,
      "max": 1000000,
      "step": 1,
      "default": 12480,
      "description": "Target value."
    },
    {
      "name": "from",
      "type": "number",
      "min": 0,
      "max": 1000000,
      "step": 1,
      "default": 0,
      "description": "Start value."
    },
    {
      "name": "duration",
      "type": "number",
      "min": 200,
      "max": 6000,
      "step": 100,
      "default": 2000,
      "description": "Ms from start to finish."
    },
    {
      "name": "decimals",
      "type": "number",
      "min": 0,
      "max": 4,
      "step": 1,
      "default": 0,
      "description": "Fraction digits."
    },
    {
      "name": "separator",
      "type": "string",
      "default": ",",
      "description": "Thousands separator."
    }
  ],
  "usage": "<CountUp to={12480} duration={2000} />"
} satisfies Meta;
