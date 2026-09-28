import type { Meta } from "../../types";

export default {
  name: "Particle Text",
  category: "text-animations",
  description: "Thousands of tiny particles swarm together to spell a word, burst away from the cursor and spring back into place.",
  props: [
    { name: "text", type: "string", default: "Glint", description: "Text the particles form." },
    { name: "particleSize", type: "number", min: 1, max: 6, step: 0.2, default: 2.2, description: "Particle size, in px." },
    { name: "gap", type: "number", min: 2, max: 12, step: 1, default: 4, description: "Sampling step in px; smaller means more particles." },
    { name: "color", type: "color", default: "#bef264", description: "First gradient color." },
    { name: "secondaryColor", type: "color", default: "#22d3ee", description: "Second gradient color." },
    { name: "sparkColor", type: "color", default: "#ffffff", description: "Color of particles while they fly." },
    { name: "repelRadius", type: "number", min: 0, max: 250, step: 5, default: 90, description: "Pointer push radius, in px." },
    { name: "repelStrength", type: "number", min: 0, max: 20, step: 0.5, default: 5, description: "How hard the pointer pushes." },
    { name: "returnSpeed", type: "number", min: 0.01, max: 0.3, step: 0.01, default: 0.06, description: "Spring pull back home." },
  ],
  usage: `<div className="relative h-80">
  <ParticleText text="Glint" />
</div>`,
} satisfies Meta;
