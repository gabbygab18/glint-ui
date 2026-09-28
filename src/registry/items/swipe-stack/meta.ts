import type { Meta } from "../../types";

export default {
  "name": "Swipe Stack",
  "category": "components",
  "description": "A deck of cards you drag away to reveal the next one. Keyboard accessible.",
  "props": [
    {
      "name": "cards",
      "type": "node",
      "description": "Array of card nodes."
    },
    {
      "name": "sensitivity",
      "type": "number",
      "min": 30,
      "max": 400,
      "step": 10,
      "default": 120,
      "description": "Px of drag to send a card back."
    },
    {
      "name": "offset",
      "type": "number",
      "min": 0,
      "max": 30,
      "step": 1,
      "default": 10,
      "description": "Px between stacked cards."
    }
  ],
  "usage": "<SwipeStack cards={photos.map((p) => <img key={p} src={p} alt=\"\" />)} />"
} satisfies Meta;
