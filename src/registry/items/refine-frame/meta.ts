import type { Meta } from "../../types";

export default {
  name: "Refine Frame",
  category: "micro-interactions",
  description: "Crop frame with springy corner handles that magnetically snap to edges, thirds and center, with snap guides and a live pixel-size readout.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "naturalWidth", type: "number", min: 100, max: 6000, step: 10, default: 1600, description: "Real image width in px (readout units)." },
    { name: "naturalHeight", type: "number", min: 100, max: 6000, step: 10, default: 1000, description: "Real image height in px." },
    { name: "snap", type: "boolean", default: true, description: "Snap edges to image edges, thirds and center." },
    { name: "snapDistance", type: "number", min: 2, max: 30, step: 1, default: 10, description: "Snap distance in screen px." },
    { name: "minSize", type: "number", min: 0.05, max: 0.5, step: 0.01, default: 0.15, description: "Smallest crop as a fraction of the image side." },
    { name: "accent", type: "color", default: "#a3e635", description: "Snap guide color." },
    { name: "src", type: "node", description: "Image URL." },
    { name: "onChange", type: "node", description: "(crop: { x, y, width, height }) => void, in image pixels." },
  ],
  usage: `<RefineFrame src={url} naturalWidth={1600} naturalHeight={1000} onChange={setCrop} />`,
} satisfies Meta;
