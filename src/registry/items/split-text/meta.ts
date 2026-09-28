import type { Meta } from "../../types";

export default {
  "name": "Split Text",
  "category": "text-animations",
  "description": "Reveals text character by character or word by word when it scrolls into view.",
  "props": [
    {
      "name": "text",
      "type": "string",
      "default": "Components that move you",
      "description": "Text to animate."
    },
    {
      "name": "splitBy",
      "type": "select",
      "options": [
        "chars",
        "words"
      ],
      "default": "chars",
      "description": "Animate each character or each word."
    },
    {
      "name": "variant",
      "type": "select",
      "options": [
        "slide",
        "blur",
        "fade"
      ],
      "default": "slide",
      "description": "Entrance style."
    },
    {
      "name": "stagger",
      "type": "number",
      "min": 0,
      "max": 200,
      "step": 5,
      "default": 35,
      "description": "Delay between pieces, in ms."
    },
    {
      "name": "duration",
      "type": "number",
      "min": 100,
      "max": 2000,
      "step": 50,
      "default": 600,
      "description": "Duration of each piece, in ms."
    },
    {
      "name": "as",
      "type": "select",
      "options": [
        "p",
        "h1",
        "h2",
        "h3",
        "span",
        "div"
      ],
      "default": "p",
      "description": "Element to render.",
      "control": false
    }
  ],
  "usage": "<SplitText text=\"Components that move you\" variant=\"blur\" />"
} satisfies Meta;
