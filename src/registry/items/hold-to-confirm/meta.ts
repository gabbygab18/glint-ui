import type { Meta } from "../../types";

export default {
  "name": "Hold To Confirm",
  "category": "buttons",
  "description": "Destructive action guard: press and hold until the bar fills. Works with Space and Enter.",
  "isNew": true,
  "props": [
    {
      "name": "duration",
      "type": "number",
      "min": 300,
      "max": 5000,
      "step": 100,
      "default": 1500,
      "description": "Ms the button must be held."
    },
    {
      "name": "label",
      "type": "string",
      "default": "Hold to delete",
      "description": "Idle label."
    },
    {
      "name": "confirmedLabel",
      "type": "string",
      "default": "Deleted",
      "description": "Label after confirming."
    },
    {
      "name": "color",
      "type": "color",
      "default": "#ef4444",
      "description": "Fill color."
    },
    {
      "name": "onConfirm",
      "type": "node",
      "description": "Called once the hold completes."
    }
  ],
  "usage": "<HoldToConfirm onConfirm={() => deleteProject(id)} />"
} satisfies Meta;
