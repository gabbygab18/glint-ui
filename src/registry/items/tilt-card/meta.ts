import type { Meta } from "../../types";

export default {
  "name": "Tilt Card",
  "category": "animations",
  "description": "3D perspective tilt that follows the pointer, with an optional glare.",
  "props": [
    {
      "name": "children",
      "type": "node",
      "description": "Card content."
    },
    {
      "name": "maxTilt",
      "type": "number",
      "min": 0,
      "max": 30,
      "step": 1,
      "default": 12,
      "description": "Max rotation in degrees."
    },
    {
      "name": "scale",
      "type": "number",
      "min": 1,
      "max": 1.2,
      "step": 0.01,
      "default": 1.04,
      "description": "Scale while hovered."
    },
    {
      "name": "glare",
      "type": "boolean",
      "default": true,
      "description": "Show a light glare."
    }
  ],
  "usage": "<TiltCard className=\"rounded-2xl\">\n  <img src=\"/cover.jpg\" alt=\"\" className=\"rounded-2xl\" />\n</TiltCard>"
} satisfies Meta;
