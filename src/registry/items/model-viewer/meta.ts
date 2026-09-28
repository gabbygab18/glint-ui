import type { Meta } from "../../types";

export default {
  name: "Model Viewer",
  category: "components",
  description: "Three.js studio viewer for a procedural model: physical clearcoat material, soft shadows, drag to orbit, auto-rotate and clamped zoom.",
  dependencies: ["three"],
  props: [
    { name: "shape", type: "select", options: ["torus-knot", "blob", "rounded-box", "torus"], default: "torus-knot", description: "Procedural model to show." },
    { name: "color", type: "color", default: "#c4b5fd", description: "Base material color." },
    { name: "metalness", type: "number", min: 0, max: 1, step: 0.05, default: 0.65, description: "0 = dielectric, 1 = metal." },
    { name: "roughness", type: "number", min: 0, max: 1, step: 0.02, default: 0.18, description: "Surface roughness." },
    { name: "iridescence", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Thin-film rainbow sheen." },
    { name: "autoRotate", type: "boolean", default: true, description: "Spin slowly when idle." },
    { name: "autoRotateSpeed", type: "number", min: 0, max: 10, step: 0.5, default: 1.5, description: "Auto-rotate speed (2 = 30s per turn)." },
    { name: "minDistance", type: "number", min: 2, max: 6, step: 0.5, default: 3, description: "Closest camera distance." },
    { name: "maxDistance", type: "number", min: 4, max: 15, step: 0.5, default: 9, description: "Farthest camera distance." },
    { name: "shadow", type: "boolean", default: true, description: "Soft contact shadow under the model." },
  ],
  usage: `<div className="h-96">\n  <ModelViewer shape="torus-knot" color="#c4b5fd" />\n</div>`,
} satisfies Meta;
