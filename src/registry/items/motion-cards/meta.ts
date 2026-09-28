import type { Meta } from "../../types";

export default {
  name: "Motion Cards",
  category: "components",
  description: "A card grid that springs in with a stagger and, when filtered by tag, shrinks leaving cards away while the rest glide into their new cells.",
  dependencies: ["motion"],
  props: [
    { name: "items", type: "node", description: "Array of { id, title, description?, image?, eyebrow?, tags }." },
    { name: "columns", type: "number", min: 1, max: 6, step: 1, default: 4, description: "Grid columns on wide screens." },
    { name: "stagger", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.06, description: "Seconds between card entrances." },
    { name: "bounce", type: "number", min: 0, max: 0.5, step: 0.05, default: 0.25, description: "Spring bounce for entrances and reordering." },
    { name: "showFilter", type: "boolean", default: true, description: "Show the tag filter bar." },
    { name: "allLabel", type: "string", default: "All", description: "Label of the show-everything filter; empty hides it." },
    { name: "onFilterChange", type: "node", description: "Called with the active tag, or null for all." },
  ],
  usage: `<MotionCards
  items={[
    { id: "1", title: "Designing calm interfaces", image: "/a.jpg", tags: ["Design"] },
    { id: "2", title: "Edge caching in practice", image: "/b.jpg", tags: ["Engineering"] },
  ]}
/>`,
} satisfies Meta;
