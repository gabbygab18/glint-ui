import type { Meta } from "../../types";

export default {
  name: "Vercel Card",
  category: "components",
  description: "Minimal monochrome card with a fading grid, corner plus markers and a pointer spotlight that lights up the grid lines.",
  props: [
    { name: "children", type: "node", description: "Card content." },
    { name: "gridSize", type: "number", min: 8, max: 64, step: 2, default: 24, description: "Grid cell size in px." },
    { name: "grid", type: "boolean", default: true, description: "Show the grid pattern." },
    { name: "markers", type: "boolean", default: true, description: "Plus markers on the corners." },
    { name: "spotlightSize", type: "number", min: 80, max: 600, step: 10, default: 320, description: "Spotlight radius in px." },
  ],
  usage: `<VercelCard>
  <div className="p-7">
    <h3>Instant rollbacks</h3>
    <p>Revert production in one click.</p>
  </div>
</VercelCard>`,
} satisfies Meta;
