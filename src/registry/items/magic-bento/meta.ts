import type { Meta } from "../../types";

export default {
  name: "Magic Bento",
  category: "components",
  description: "Bento grid whose cards light up with a cursor-following border glow, tilt gently and fill with drifting particles on hover.",
  dependencies: ["lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { label, title, description, icon? }. Six items fill the grid." },
    { name: "glowColor", type: "color", default: "#a78bfa", description: "Glow, spotlight and particle color." },
    { name: "spotlightRadius", type: "number", min: 120, max: 600, step: 10, default: 320, description: "Px radius of the cursor spotlight." },
    { name: "tilt", type: "number", min: 0, max: 20, step: 1, default: 6, description: "Max card tilt in degrees (0 disables)." },
    { name: "particles", type: "boolean", default: true, description: "Floating particles inside the hovered card." },
    { name: "particleCount", type: "number", min: 0, max: 30, step: 1, default: 10, description: "Particles per card." },
  ],
  usage: `<MagicBento glowColor="#a78bfa" />`,
} satisfies Meta;
