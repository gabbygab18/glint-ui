import type { Meta } from "../../types";

export default {
  "name": "Dock",
  "category": "components",
  "description": "macOS-style toolbar where icons magnify as the cursor passes.",
  "props": [
    {
      "name": "items",
      "type": "node",
      "description": "Array of { label, icon, onClick }."
    },
    {
      "name": "baseSize",
      "type": "number",
      "min": 24,
      "max": 80,
      "step": 2,
      "default": 48,
      "description": "Resting icon size in px."
    },
    {
      "name": "magnification",
      "type": "number",
      "min": 24,
      "max": 140,
      "step": 2,
      "default": 80,
      "description": "Icon size under the cursor, in px."
    },
    {
      "name": "distance",
      "type": "number",
      "min": 40,
      "max": 400,
      "step": 10,
      "default": 140,
      "description": "Px where magnification fades out."
    }
  ],
  "usage": "<Dock items={[{ label: \"Home\", icon: <HomeIcon /> }, { label: \"Search\", icon: <SearchIcon /> }]} />"
} satisfies Meta;
