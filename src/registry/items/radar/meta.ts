import type { Meta } from "../../types";

export default {
  name: "Radar",
  category: "backgrounds",
  description: "A phosphor radar scope: a rotating sweep with a fading trail, range rings, bearing ticks and contacts that ping as the beam passes. WebGL.",
  props: [
    { name: "color", type: "color", default: "#34d399", description: "Phosphor color." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Sweep speed multiplier." },
    { name: "rings", type: "number", min: 1, max: 10, step: 1, default: 4, description: "Range rings inside the scope." },
    { name: "trail", type: "number", min: 0.2, max: 3, step: 0.1, default: 1, description: "Sweep trail length." },
    { name: "blips", type: "number", min: 0, max: 16, step: 1, default: 9, description: "Number of contacts." },
    { name: "size", type: "number", min: 0.3, max: 1.5, step: 0.05, default: 0.85, description: "Scope size, fraction of height." },
  ],
  usage: `<div className="relative h-96">
  <Radar color="#34d399" rings={4} />
</div>`,
} satisfies Meta;
