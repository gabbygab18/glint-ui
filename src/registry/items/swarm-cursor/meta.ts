import type { Meta } from "../../types";

export default {
  name: "Swarm Cursor",
  category: "animations",
  description: "A flock of boids that separates, aligns and swirls around the cursor, leaving luminous trails.",
  props: [
    { name: "count", type: "number", min: 20, max: 400, step: 10, default: 160, description: "Number of boids." },
    { name: "color", type: "color", default: "#c6ff3d", description: "Boid color." },
    { name: "accent", type: "color", default: "#22d3ee", description: "Color of the fastest boids." },
    { name: "maxSpeed", type: "number", min: 1, max: 12, step: 0.5, default: 5, description: "Top speed in px per frame." },
    { name: "size", type: "number", min: 2, max: 20, step: 1, default: 7, description: "Boid length in px." },
    { name: "trails", type: "boolean", default: true, description: "Draw faint motion trails behind each boid." },
  ],
  usage: `<div className="relative h-96">\n  <SwarmCursor count={160} />\n</div>`,
} satisfies Meta;
