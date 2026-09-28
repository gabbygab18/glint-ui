import type { Meta } from "../../types";

export default {
  name: "Matrix Orb",
  category: "widgets",
  description: "A liquid metaball orb for voice or AI status: it breathes when idle, ripples when listening and churns off droplets when thinking.",
  isNew: true,
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Body ink." },
    { name: "size", type: "number", min: 80, max: 360, step: 4, default: 240, description: "Stage width and height, in px." },
    { name: "lobes", type: "number", min: 2, max: 10, step: 1, default: 5, description: "Satellites around the core. More means a busier body." },
    { name: "gooey", type: "boolean", default: true, description: "Run the metaball fuse. Off, the circles just overlap." },
    { name: "threshold", type: "number", min: 6, max: 40, step: 1, default: 19, description: "Alpha ramp slope: how hard the fused edge is." },
    { name: "caption", type: "boolean", default: true, description: "Show the state caption under the orb." },
    { name: "color", type: "color", control: false, description: "Body colour, overriding the variant ink." },
    { name: "state", type: "select", options: ["idle", "listening", "thinking"], default: "idle", control: false, description: "What the orb is doing. The demo cycles it." },
    { name: "level", type: "number", min: 0, max: 1, step: 0.01, control: false, description: "Drive the amplitude yourself (e.g. an audio level), 0-1." },
    { name: "labels", type: "node", description: "Caption per state, e.g. `{ thinking: \"Working\" }`." },
    { name: "viscosity", type: "number", min: 1, max: 60, control: false, description: "Fuse blur in px. Defaults to 0.078 of the size." },
    { name: "waviness", type: "number", min: 0, max: 20, control: false, description: "Max px the edge undulates. Defaults to 0.012 of the size." },
    { name: "wavinessFreq", type: "number", min: 0.005, max: 0.2, default: 0.018, control: false, description: "Noise frequency of the edge undulation." },
    { name: "shadow", type: "string", control: false, description: "CSS filter for the cast shadow; \"none\" for a bare orb without shadow or rim." },
  ],
  usage: `<MatrixOrb state="listening" variant="calamansi" size={200} />`,
} satisfies Meta;
