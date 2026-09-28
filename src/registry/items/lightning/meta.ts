import type { Meta } from "../../types";

export default {
  name: "Lightning",
  category: "backgrounds",
  description: "A crackling procedural lightning bolt with forking branches, strobing strikes and storm clouds lit from within. WebGL.",
  props: [
    { name: "hue", type: "number", min: 0, max: 360, step: 1, default: 230, description: "Bolt hue in degrees." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "intensity", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Bolt and flash brightness." },
    { name: "size", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Bolt scale; larger zooms in." },
    { name: "xOffset", type: "number", min: -1, max: 1, step: 0.05, default: 0, description: "Horizontal position, -1 left to 1 right." },
    { name: "interval", type: "number", min: 0.5, max: 8, step: 0.1, default: 2.4, description: "Seconds between strikes." },
  ],
  usage: `<div className="relative h-96">
  <Lightning hue={230} />
</div>`,
} satisfies Meta;
