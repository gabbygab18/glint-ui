import type { Meta } from "../../types";

export default {
  name: "iPhone Mockup",
  category: "widgets",
  description: "A realistic, pure-CSS titanium phone frame with dynamic island, side buttons, status bar and a moving glass glare that tilts toward the pointer. Renders any children or an image as the screen.",
  isNew: true,
  dependencies: ["motion"],
  props: [
    { name: "color", type: "select", options: ["natural", "black", "white", "blue", "desert"], default: "natural", description: "Titanium finish." },
    { name: "width", type: "number", min: 180, max: 420, step: 10, default: 300, description: "Rendered width in px; everything scales." },
    { name: "tilt", type: "boolean", default: true, description: "Tilt toward the pointer in 3D." },
    { name: "tiltAmount", type: "number", min: 2, max: 30, step: 1, default: 14, description: "Max tilt in degrees." },
    { name: "glare", type: "boolean", default: true, description: "Diagonal glass reflection." },
    { name: "statusBar", type: "select", options: ["light", "dark", "none"], default: "light", description: "Status bar tone, or hide it." },
    { name: "time", type: "string", default: "9:41", description: "Status bar time." },
    { name: "src", type: "string", description: "Screen image URL (when no children)." },
    { name: "children", type: "node", description: "Any screen content. Fills the screen." },
  ],
  usage: `<IphoneMockup color="natural" width={300}>
  <YourAppScreen />
</IphoneMockup>

<IphoneMockup src="/screenshot.png" alt="App home screen" tilt={false} />`,
} satisfies Meta;
