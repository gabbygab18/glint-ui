import type { Meta } from "../../types";

export default {
  name: "Cursor Highlight",
  category: "animations",
  description: "A soft glow follows the cursor and springs into a pill that wraps whatever link or card you hover.",
  props: [
    { name: "children", type: "node", description: "Links, buttons or tiles to highlight." },
    { name: "selector", type: "string", default: "[data-highlight], a, button", description: "Elements the highlight snaps to." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Highlight color." },
    { name: "opacity", type: "number", min: 0.02, max: 1, step: 0.02, default: 0.16, description: "Peak opacity of the highlight." },
    { name: "blobSize", type: "number", min: 0, max: 240, step: 5, default: 90, description: "Diameter of the free-floating blob in px." },
    { name: "padding", type: "number", min: 0, max: 24, step: 1, default: 4, description: "Px the highlight extends past a hovered element." },
    { name: "radius", type: "number", min: 0, max: 40, step: 1, default: 12, description: "Corner radius when wrapped around an element, in px." },
    { name: "stiffness", type: "number", min: 0.02, max: 0.6, step: 0.02, default: 0.2, description: "Spring stiffness. Higher = snappier." },
  ],
  usage: `<CursorHighlight>
  <nav className="flex gap-2">
    <a href="/">Home</a>
    <a href="/docs">Docs</a>
  </nav>
</CursorHighlight>`,
} satisfies Meta;
