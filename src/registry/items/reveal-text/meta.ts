import type { Meta } from "../../types";

export default {
  name: "Reveal Text",
  category: "text-animations",
  description: "Letters rise out of a mask as they scroll into view; hover and a photo shows through the type.",
  props: [
    { name: "text", type: "string", default: "WANDER", description: "Text to reveal." },
    { name: "image", type: "string", default: "https://picsum.photos/seed/glint-8/1200/600", description: "Image shown through the letters on hover." },
    { name: "stagger", type: "number", min: 0, max: 200, step: 5, default: 45, description: "Delay between letters, in ms." },
    { name: "duration", type: "number", min: 200, max: 2000, step: 50, default: 900, description: "Slide duration of each letter, in ms." },
  ],
  usage: `<RevealText text="WANDER" image="/photos/coast.jpg" />`,
} satisfies Meta;
