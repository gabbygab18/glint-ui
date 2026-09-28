import type { Meta } from "../../types";

export default {
  "name": "Click Spark",
  "category": "animations",
  "description": "Bursts of sparks radiate from every click inside the area.",
  "props": [
    {
      "name": "children",
      "type": "node",
      "description": "Area that sparks on click."
    },
    {
      "name": "sparkColor",
      "type": "color",
      "default": "#ffffff",
      "description": "Spark color."
    },
    {
      "name": "sparkCount",
      "type": "number",
      "min": 3,
      "max": 24,
      "step": 1,
      "default": 8,
      "description": "Sparks per click."
    },
    {
      "name": "sparkRadius",
      "type": "number",
      "min": 5,
      "max": 100,
      "step": 1,
      "default": 24,
      "description": "How far sparks travel, in px."
    },
    {
      "name": "sparkSize",
      "type": "number",
      "min": 2,
      "max": 30,
      "step": 1,
      "default": 10,
      "description": "Spark line length, in px."
    },
    {
      "name": "duration",
      "type": "number",
      "min": 100,
      "max": 1500,
      "step": 50,
      "default": 400,
      "description": "Ms per burst."
    }
  ],
  "usage": "<ClickSpark sparkColor=\"#c6ff3d\">\n  <div className=\"h-64\">Click anywhere</div>\n</ClickSpark>"
} satisfies Meta;
