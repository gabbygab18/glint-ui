import type { Meta } from "../../types";

export default {
  name: "Shuffle Text",
  category: "text-animations",
  description: "Each letter spins like a slot-machine reel and lands on its final character, on view and on hover.",
  props: [
    { name: "text", type: "string", default: "Jackpot", description: "Final text." },
    { name: "duration", type: "number", min: 200, max: 3000, step: 50, default: 900, description: "Ms each reel spins." },
    { name: "stagger", type: "number", min: 0, max: 200, step: 5, default: 45, description: "Ms between reels starting." },
    { name: "spins", type: "number", min: 1, max: 30, step: 1, default: 8, description: "Random glyphs per reel before landing." },
    {
      name: "characters",
      type: "string",
      default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#&%",
      description: "Glyphs used on the reels.",
    },
    { name: "shuffleOnHover", type: "boolean", default: true, description: "Spin again on every hover." },
  ],
  usage: `<ShuffleText text="Jackpot" duration={900} stagger={45} />`,
} satisfies Meta;
