import type { Meta } from "../../types";

export default {
  name: "Target Cursor",
  category: "animations",
  description: "A spinning reticle cursor whose corner brackets snap around any element you mark as a target.",
  props: [
    { name: "children", type: "node", description: "Content. Mark targets with data-cursor-target." },
    { name: "targetSelector", type: "string", default: "[data-cursor-target]", description: "Elements matching this selector get wrapped by the brackets." },
    { name: "color", type: "color", default: "#ffffff", description: "Reticle color." },
    { name: "spinSpeed", type: "number", min: 0, max: 720, step: 10, default: 120, description: "Degrees per second the idle reticle spins." },
    { name: "size", type: "number", min: 16, max: 80, step: 2, default: 34, description: "Idle reticle size in px." },
    { name: "padding", type: "number", min: 0, max: 24, step: 1, default: 8, description: "Px between a target and the brackets." },
    { name: "hideCursor", type: "boolean", default: true, description: "Hide the system cursor inside the container (mouse only)." },
  ],
  usage: `<TargetCursor className="h-96">\n  <button data-cursor-target>Hover me</button>\n</TargetCursor>`,
} satisfies Meta;
