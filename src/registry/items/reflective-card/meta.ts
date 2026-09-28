import type { Meta } from "../../types";

export default {
  name: "Reflective Card",
  category: "components",
  description: "Polished metal or glass card whose streaks, specular band and hotspot slide across the surface as the pointer tilts it.",
  props: [
    { name: "children", type: "node", description: "Card content." },
    { name: "finish", type: "select", options: ["silver", "gold", "graphite", "rose", "glass"], default: "silver", description: "Surface material." },
    { name: "maxTilt", type: "number", min: 0, max: 25, step: 1, default: 10, description: "Max tilt in degrees." },
    { name: "sheen", type: "number", min: 0, max: 1, step: 0.05, default: 0.8, description: "Brightness of the moving reflections." },
    { name: "brushed", type: "boolean", default: true, description: "Fine brushed-metal lines." },
  ],
  usage: `<ReflectiveCard finish="graphite">
  <div className="p-6">Obsidian Member</div>
</ReflectiveCard>`,
} satisfies Meta;
