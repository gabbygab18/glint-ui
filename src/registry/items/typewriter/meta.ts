import type { Meta } from "../../types";

export default {
  "name": "Typewriter",
  "category": "text-animations",
  "description": "Types and deletes a list of phrases with a blinking cursor.",
  "props": [
    {
      "name": "words",
      "type": "list",
      "default": [
        "Build faster.",
        "Ship prettier.",
        "Copy. Paste. Done."
      ],
      "description": "Phrases to type."
    },
    {
      "name": "typeSpeed",
      "type": "number",
      "min": 10,
      "max": 300,
      "step": 10,
      "default": 70,
      "description": "Ms per typed character."
    },
    {
      "name": "deleteSpeed",
      "type": "number",
      "min": 10,
      "max": 300,
      "step": 10,
      "default": 40,
      "description": "Ms per deleted character."
    },
    {
      "name": "pause",
      "type": "number",
      "min": 200,
      "max": 5000,
      "step": 100,
      "default": 1500,
      "description": "Ms to hold a finished phrase."
    },
    {
      "name": "cursor",
      "type": "string",
      "default": "|",
      "description": "Cursor glyph."
    }
  ],
  "usage": "<Typewriter words={[\"Build faster.\", \"Ship prettier.\"]} />"
} satisfies Meta;
