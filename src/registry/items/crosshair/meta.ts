import type { Meta } from "../../types";

export default {
  name: "Crosshair",
  category: "animations",
  description: "Full-bleed crosshair lines with live coordinates that tear and glitch when you hover a link.",
  props: [
    { name: "children", type: "node", description: "Content under the crosshair." },
    { name: "color", type: "color", default: "#ffffff", description: "Line and label color." },
    { name: "thickness", type: "number", min: 0.5, max: 4, step: 0.5, default: 1, description: "Line width in px." },
    { name: "showCoords", type: "boolean", default: true, description: "Show live x/y readouts on the lines." },
    { name: "glitch", type: "boolean", default: true, description: "Distort the lines briefly when the pointer enters a target." },
    { name: "targetSelector", type: "string", default: "a, button", description: "Elements that trigger the glitch." },
    { name: "hideCursor", type: "boolean", default: true, description: "Hide the native cursor inside the container." },
  ],
  usage: `<Crosshair className="h-screen">
  <nav>...</nav>
</Crosshair>`,
} satisfies Meta;
