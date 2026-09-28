import type { Meta } from "../../types";

export default {
  name: "Lattice Loader",
  category: "micro-interactions",
  description: "A tiny isometric lattice of cubes or dots that pulses in a diagonal wave while the whole grid sways in 3D. Pure CSS.",
  isNew: true,
  props: [
    { name: "size", type: "number", min: 24, max: 160, step: 4, default: 72, description: "Overall size in px." },
    { name: "grid", type: "number", min: 2, max: 4, step: 1, default: 3, description: "Nodes per edge." },
    { name: "variant", type: "select", options: ["cubes", "dots"], default: "cubes", description: "Node shape." },
    { name: "color", type: "color", default: "#a3e635", description: "Node color." },
    { name: "duration", type: "number", min: 0.6, max: 4, step: 0.1, default: 1.4, description: "Seconds per pulse wave." },
    { name: "label", type: "string", default: "Loading", description: "Screen-reader text." },
  ],
  usage: `<LatticeLoader size={48} color="#a3e635" />`,
} satisfies Meta;
