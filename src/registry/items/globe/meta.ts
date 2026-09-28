import type { Meta } from "../../types";

export default {
  name: "Globe",
  category: "widgets",
  description: "A rotating dotted globe drawn on canvas, with pulsing city markers, great-circle arcs carrying travelling light, drag-to-spin inertia and a soft atmosphere.",
  isNew: true,
  props: [
    { name: "dotColor", type: "color", default: "#94a3b8", description: "Land dot color." },
    { name: "accent", type: "color", default: "#c6ff3d", description: "Markers, arcs and atmosphere." },
    { name: "speed", type: "number", min: 0, max: 40, step: 1, default: 8, description: "Auto-rotation, degrees per second." },
    { name: "tilt", type: "number", min: -40, max: 40, step: 1, default: 18, description: "Axial tilt in degrees." },
    { name: "density", type: "number", min: 3000, max: 30000, step: 1000, default: 12000, description: "Dots sampled over the sphere." },
    { name: "showLabels", type: "boolean", default: false, description: "City labels on the front side." },
    { name: "markers", type: "node", description: "`{ lat, lon, label? }[]`. Ships with ten world cities." },
    { name: "arcs", type: "node", description: "`[fromIndex, toIndex][]` into `markers`." },
  ],
  usage: `<Globe
  markers={[
    { lat: 37.77, lon: -122.42, label: "San Francisco" },
    { lat: 51.5, lon: -0.12, label: "London" },
    { lat: 35.68, lon: 139.69, label: "Tokyo" },
  ]}
  arcs={[[0, 1], [0, 2]]}
/>`,
} satisfies Meta;
