import type { Meta } from "../../types";

export default {
  name: "Prism",
  category: "backgrounds",
  description: "A slowly rotating glass prism splitting a white beam into a shimmering rainbow fan. Aim the beam with the cursor. WebGL.",
  props: [
    { name: "beamColor", type: "color", default: "#ffffff", description: "Incoming light color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Rotation speed multiplier." },
    { name: "size", type: "number", min: 0.08, max: 0.4, step: 0.01, default: 0.2, description: "Prism size, fraction of height." },
    { name: "spread", type: "number", min: 0.1, max: 1.2, step: 0.05, default: 0.5, description: "Rainbow fan width in radians." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Brightness." },
    { name: "followMouse", type: "boolean", default: true, description: "Aim the beam from the cursor when it is left of the prism." },
  ],
  usage: `<div className="relative h-96">
  <Prism size={0.2} spread={0.5} />
</div>`,
} satisfies Meta;
