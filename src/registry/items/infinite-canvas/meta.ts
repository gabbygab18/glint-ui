import type { Meta } from "../../types";

export default {
  name: "Infinite Canvas",
  category: "components",
  description: "A bounded moodboard-style canvas on a dotted grid: drag to pan with inertia, scroll or pinch to zoom around the pointer, keyboard friendly.",
  dependencies: ["lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { id, x, y, content }, positioned by their center in world px." },
    { name: "defaultZoom", type: "number", min: 0.3, max: 2, step: 0.05, default: 0.8, description: "Zoom at first render and on reset." },
    { name: "minZoom", type: "number", min: 0.1, max: 1, step: 0.05, default: 0.3, description: "Smallest zoom." },
    { name: "maxZoom", type: "number", min: 1, max: 5, step: 0.1, default: 2.5, description: "Largest zoom." },
    { name: "worldWidth", type: "number", min: 800, max: 6000, step: 100, default: 2400, description: "World width in px; panning stops at its edges." },
    { name: "worldHeight", type: "number", min: 600, max: 6000, step: 100, default: 1600, description: "World height in px." },
    { name: "gridGap", type: "number", min: 8, max: 64, step: 1, default: 24, description: "Px between grid dots at 100%." },
    { name: "dotSize", type: "number", min: 0.5, max: 3, step: 0.1, default: 1.1, description: "Grid dot radius in px." },
    { name: "inertia", type: "boolean", default: true, description: "Glide after a flick." },
    { name: "showControls", type: "boolean", default: true, description: "Show the zoom buttons." },
    { name: "label", type: "string", control: false, description: "Accessible name for the canvas." },
  ],
  usage: `<div className="h-[600px]">
  <InfiniteCanvas
    items={[
      { id: "a", x: 0, y: 0, content: <Card title="Start here" /> },
      { id: "b", x: 400, y: 120, content: <img src="/shot.jpg" alt="" /> },
    ]}
  />
</div>`,
} satisfies Meta;
