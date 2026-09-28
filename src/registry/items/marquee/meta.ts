import type { Meta } from "../../types";

export default {
  name: "Marquee",
  category: "animations",
  description:
    "Infinite logo loop that eases to a stop on hover, grows the logo under the cursor and fades its edges. Works with any content.",
  props: [
    { name: "items", type: "node", description: "Array of nodes to loop (logos, text, cards)." },
    { name: "speed", type: "number", min: 10, max: 300, step: 5, default: 60, description: "Scroll speed in px per second." },
    { name: "hoverSpeed", type: "number", min: 0, max: 200, step: 5, default: 0, description: "Speed while hovered, px per second. 0 glides to a stop." },
    { name: "direction", type: "select", options: ["left", "right"], default: "left", description: "Scroll direction." },
    { name: "gap", type: "number", min: 0, max: 160, step: 4, default: 48, description: "Px between items." },
    { name: "scaleOnHover", type: "boolean", default: true, description: "Grow the hovered item." },
    { name: "fadeEdges", type: "boolean", default: true, description: "Fade out both edges." },
    { name: "ariaLabel", type: "string", default: "Logos", description: "Accessible name for the list." },
  ],
  usage: `<Marquee
  items={logos.map((l) => <img key={l.name} src={l.src} alt={l.name} className="h-8" />)}
  speed={60}
  hoverSpeed={0}
/>`,
} satisfies Meta;
