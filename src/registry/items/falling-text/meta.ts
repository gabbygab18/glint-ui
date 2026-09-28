import type { Meta } from "../../types";

export default {
  name: "Falling Text",
  category: "text-animations",
  description: "A paragraph whose words tumble down and pile up with real physics on hover, click or view, then can be grabbed and tossed around.",
  dependencies: ["matter-js"],
  props: [
    { name: "text", type: "string", default: "React components that move you. Drop them in, drag them around, and ship interfaces people remember.", description: "Paragraph to drop." },
    { name: "highlightWords", type: "list", default: ["move", "drag", "ship", "remember"], description: "Words drawn in the accent color (punctuation ignored)." },
    { name: "trigger", type: "select", options: ["hover", "click", "view", "auto"], default: "hover", description: "What drops the words. `auto` drops them right after mount." },
    { name: "gravity", type: "number", min: 0.1, max: 3, step: 0.1, default: 1, description: "Gravity strength." },
    { name: "restitution", type: "number", min: 0, max: 1, step: 0.05, default: 0.4, description: "Bounciness." },
    { name: "highlightColor", type: "color", default: "#a3e635", description: "Accent color for highlighted words." },
  ],
  usage: `<div className="h-96">
  <FallingText trigger="hover" highlightWords={["move", "ship"]} />
</div>`,
} satisfies Meta;
