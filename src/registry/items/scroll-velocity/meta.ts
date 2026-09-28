import type { Meta } from "../../types";

export default {
  name: "Scroll Velocity",
  category: "text-animations",
  description: "Rows of oversized marquee text that drift on their own and surge or reverse with scroll speed.",
  props: [
    {
      name: "texts",
      type: "list",
      default: ["Scroll faster", "Feel the motion", "Built to move"],
      description: "One row per string. Rows alternate direction.",
    },
    { name: "baseVelocity", type: "number", min: 0, max: 300, step: 5, default: 60, description: "Drift speed in px per second while idle." },
    { name: "velocityFactor", type: "number", min: 0, max: 2, step: 0.05, default: 0.4, description: "How much scroll speed adds to the drift." },
    { name: "skew", type: "boolean", default: true, description: "Lean rows in the direction of travel." },
    { name: "outlineAlternate", type: "boolean", default: true, description: "Outline every other row." },
    { name: "separator", type: "string", default: "✦", description: "Glyph between repeats." },
    { name: "scrollContainerRef", type: "node", description: "Ref to the scrolling element. Defaults to the window." },
  ],
  usage: `<ScrollVelocity texts={["Scroll faster", "Feel the motion"]} baseVelocity={60} />`,
} satisfies Meta;
