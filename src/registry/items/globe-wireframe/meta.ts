import type { Meta } from "../../types";

export default {
  name: "Globe Wireframe",
  category: "widgets",
  description: "A rotating wireframe globe of latitude and longitude lines with depth-faded hidden lines and a glowing scan that sweeps pole to pole or across the face. Drag to spin.",
  isNew: true,
  props: [
    { name: "lineColor", type: "color", default: "#64748b", description: "Grid line color." },
    { name: "accent", type: "color", default: "#22d3ee", description: "Scan highlight and rim color." },
    { name: "scan", type: "select", options: ["latitude", "longitude", "none"], default: "latitude", description: "Scan direction." },
    { name: "scanDuration", type: "number", min: 1, max: 12, step: 0.5, default: 4, description: "Seconds per scan pass." },
    { name: "latStep", type: "number", min: 5, max: 45, step: 5, default: 15, description: "Degrees between parallels." },
    { name: "lonStep", type: "number", min: 5, max: 45, step: 5, default: 15, description: "Degrees between meridians." },
    { name: "speed", type: "number", min: 0, max: 60, step: 1, default: 10, description: "Auto-rotation, degrees per second." },
    { name: "tilt", type: "number", min: -40, max: 40, step: 1, default: 20, description: "Axial tilt in degrees." },
  ],
  usage: `<GlobeWireframe accent="#22d3ee" scan="latitude" />`,
} satisfies Meta;
