import type { Meta } from "../../types";

export default {
  name: "Ghost Cursor",
  category: "animations",
  description: "Translucent, drifting echoes of the cursor trail behind the pointer like afterimages.",
  props: [
    { name: "children", type: "node", description: "Content under the cursor." },
    { name: "color", type: "color", default: "#ffffff", description: "Color of the live cursor." },
    { name: "ghostColor", type: "color", default: "#a78bfa", description: "Tint of the trailing ghosts." },
    { name: "count", type: "number", min: 1, max: 14, step: 1, default: 6, description: "Number of ghost copies." },
    { name: "spacing", type: "number", min: 1, max: 12, step: 1, default: 4, description: "Frames of delay between consecutive ghosts." },
    { name: "size", type: "number", min: 12, max: 72, step: 2, default: 28, description: "Cursor size in px." },
    { name: "shape", type: "select", options: ["arrow", "ghost", "dot"], default: "arrow", description: "Cursor shape." },
    { name: "hideCursor", type: "boolean", default: true, description: "Hide the native cursor inside the container." },
  ],
  usage: `<GhostCursor className="h-96" shape="ghost">
  <p>Boo.</p>
</GhostCursor>`,
} satisfies Meta;
