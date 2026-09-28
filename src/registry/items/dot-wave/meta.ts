import type { Meta } from "../../types";

export default {
  name: "Dot Wave",
  category: "backgrounds",
  description: "A perspective field of dots rolling in layered sine waves, fading into the horizon. Canvas 2D.",
  props: [
    { name: "color", type: "color", default: "#5eead4", description: "Color of the nearest dots." },
    { name: "farColor", type: "color", default: "#818cf8", description: "Color the dots blend toward on the horizon." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Animation speed multiplier." },
    { name: "amplitude", type: "number", min: 0, max: 3, step: 0.1, default: 1, description: "Wave height." },
    { name: "scale", type: "number", min: 0.3, max: 3, step: 0.1, default: 1, description: "Wave length; higher means tighter ripples." },
    { name: "spacing", type: "number", min: 0.5, max: 2.5, step: 0.1, default: 1, description: "Distance between dots; lower is denser." },
    { name: "dotSize", type: "number", min: 0.5, max: 6, step: 0.1, default: 2.4, description: "Radius of the nearest dots in px." },
  ],
  usage: `<div className="relative h-96">
  <DotWave color="#5eead4" farColor="#818cf8" />
</div>`,
} satisfies Meta;
