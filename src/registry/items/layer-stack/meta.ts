import type { Meta } from "../../types";

export default {
  name: "Layer Stack",
  category: "components",
  description: "Translucent design layers stacked in isometric view that fan apart on hover, with a layers panel to spotlight each one.",
  props: [
    { name: "layers", type: "node", description: "Array of { label, content, icon? }. First item is the top layer." },
    { name: "width", type: "number", min: 160, max: 360, step: 10, default: 260, description: "Layer width in px." },
    { name: "height", type: "number", min: 100, max: 260, step: 10, default: 180, description: "Layer height in px." },
    { name: "spread", type: "number", min: 20, max: 100, step: 2, default: 56, description: "Px between layers when fanned out." },
    { name: "restGap", type: "number", min: 0, max: 30, step: 1, default: 6, description: "Px between layers at rest." },
    { name: "pitch", type: "number", min: 20, max: 75, step: 1, default: 56, description: "Camera pitch in degrees." },
    { name: "expanded", type: "boolean", default: false, description: "Keep the stack fanned out." },
    { name: "showPanel", type: "boolean", default: true, description: "Show the layers panel." },
  ],
  usage: `<LayerStack
  layers={[
    { label: "Text", content: <h3>Hello</h3> },
    { label: "Image", content: <img src="/photo.jpg" alt="" /> },
    { label: "Background", content: <div className="size-full bg-gradient-to-br from-violet-500 to-cyan-400" /> },
  ]}
/>`,
} satisfies Meta;
