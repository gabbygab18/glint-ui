import type { Meta } from "../../types";

export default {
  "name": "Decrypted Text",
  "category": "text-animations",
  "description": "Scrambled glyphs resolve into the real text, on view or on hover.",
  "props": [
    {
      "name": "text",
      "type": "string",
      "default": "Access granted",
      "description": "Final text."
    },
    {
      "name": "speed",
      "type": "number",
      "min": 10,
      "max": 200,
      "step": 5,
      "default": 40,
      "description": "Ms between reveal steps."
    },
    {
      "name": "characters",
      "type": "string",
      "default": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*",
      "description": "Glyphs used while scrambling."
    },
    {
      "name": "revealDirection",
      "type": "select",
      "options": [
        "start",
        "end",
        "random"
      ],
      "default": "start",
      "description": "Order characters resolve in."
    },
    {
      "name": "trigger",
      "type": "select",
      "options": [
        "view",
        "hover"
      ],
      "default": "view",
      "description": "Start on scroll into view or on every hover."
    }
  ],
  "usage": "<DecryptedText text=\"Access granted\" revealDirection=\"random\" />"
} satisfies Meta;
