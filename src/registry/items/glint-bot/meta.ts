import type { Meta } from "../../types";

export default {
  name: "Glint Bot",
  category: "widgets",
  description:
    "A retro robot with a lit CSS-3D visor head that turns toward your cursor, spinning reel eyes and jointed arms. It blinks, smiles when booped, blushes when petted and gets dizzy if you poke it too much.",
  isNew: true,
  props: [
    { name: "size", type: "number", min: 120, max: 420, step: 10, default: 280, description: "Overall size in px." },
    { name: "color", type: "color", default: "#b5e61d", description: "Head color. Lighting is computed, so any color shades correctly." },
    { name: "accent", type: "color", default: "#f4b860", description: "Band around the top of the head." },
    { name: "screen", type: "color", default: "#141a0f", description: "Visor glass color." },
    { name: "ink", type: "color", default: "#d9ff6b", description: "Lens and grille glow color." },
    { name: "followCursor", type: "boolean", default: true, description: "Turn the head toward the pointer." },
    { name: "wave", type: "boolean", default: false, description: "Raise the right arm and wave." },
    { name: "interactive", type: "boolean", default: true, description: "Blink and react to clicks, petting and poking." },
    { name: "label", type: "string", default: "Glint Bot", description: "Accessible name." },
  ],
  usage: `<GlintBot size={280} color="#b5e61d" />`,
} satisfies Meta;
