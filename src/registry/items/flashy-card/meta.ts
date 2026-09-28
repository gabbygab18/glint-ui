import type { Meta } from "../../types";

export default {
  name: "Flashy Card",
  category: "components",
  description: "A card with a comet of gradient light sweeping its border that brightens, blooms into a glow and flashes across the surface on hover.",
  props: [
    { name: "children", type: "node", description: "Card content." },
    { name: "colors", type: "list", default: ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"], description: "Gradient stops of the sweeping light." },
    { name: "speed", type: "number", min: 0.5, max: 10, step: 0.25, default: 3, description: "Seconds per full sweep." },
    { name: "borderWidth", type: "number", min: 1, max: 6, step: 0.5, default: 1.5, description: "Border thickness in px." },
    { name: "radius", type: "number", min: 0, max: 40, step: 1, default: 20, description: "Corner radius in px." },
    { name: "glow", type: "number", min: 0, max: 1, step: 0.05, default: 0.6, description: "Glow strength on hover." },
    { name: "trigger", type: "select", options: ["hover", "always"], default: "hover", description: "Light up on hover/focus, or always." },
  ],
  usage: `<FlashyCard colors={["#22d3ee", "#a78bfa", "#f472b6"]} speed={3}>
  <PricingPlan />
</FlashyCard>`,
} satisfies Meta;
