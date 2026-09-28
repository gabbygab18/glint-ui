import type { Meta } from "../../types";

export default {
  name: "Motion Grid",
  category: "animations",
  description: "A grid of tiles that shrink, spin and flash in rolling waves radiating from whichever tile you click.",
  props: [
    { name: "rows", type: "number", min: 2, max: 20, step: 1, default: 9, description: "Tile rows." },
    { name: "cols", type: "number", min: 2, max: 30, step: 1, default: 15, description: "Tile columns." },
    { name: "gap", type: "number", min: 0, max: 20, step: 1, default: 6, description: "Px between tiles." },
    { name: "stagger", type: "number", min: 5, max: 150, step: 5, default: 45, description: "Ms of delay per tile of distance." },
    { name: "duration", type: "number", min: 200, max: 2500, step: 50, default: 900, description: "Ms per tile wave." },
    { name: "accent", type: "color", default: "#c6ff3d", description: "Flash color as the wave passes." },
    { name: "autoplay", type: "boolean", default: true, description: "Send waves from random tiles on its own." },
  ],
  usage: `<MotionGrid rows={9} cols={15} />`,
} satisfies Meta;
