import type { Meta } from "../../types";

export default {
  name: "Curved Loop",
  category: "text-animations",
  description: "An endless marquee flowing along a curved path. Grab it to scrub, and flick to send it the other way.",
  props: [
    { name: "text", type: "string", default: "Glint ✦ Motion ✦ Components ✦ ", description: "Text to loop. End with a separator for a seamless join." },
    { name: "speed", type: "number", min: 0, max: 10, step: 0.5, default: 2, description: "Scroll speed in px per frame." },
    { name: "curveAmount", type: "number", min: -500, max: 500, step: 10, default: 300, description: "Depth of the curve; negative bends upward." },
    { name: "direction", type: "select", options: ["left", "right"], default: "left", description: "Initial scroll direction." },
    { name: "interactive", type: "boolean", default: true, description: "Drag to scrub and flick to change direction." },
  ],
  usage: `<CurvedLoop text="Glint ✦ Motion ✦ Components ✦ " curveAmount={300} />`,
} satisfies Meta;
