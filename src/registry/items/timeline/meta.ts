import type { Meta } from "../../types";

export default {
  name: "Timeline",
  category: "components",
  description: "Vertical timeline whose glowing progress line fills as you scroll, lighting up markers and revealing entries.",
  props: [
    { name: "items", type: "node", description: "Array of { date, title, description?, icon? }." },
    { name: "scrollContainerRef", type: "node", description: "Ref to the scrolling element. Defaults to the window." },
    { name: "anchor", type: "number", min: 0.1, max: 0.9, step: 0.05, default: 0.5, description: "Viewport position of the progress head (0 top, 1 bottom)." },
    { name: "color", type: "color", default: "#a3e635", description: "Progress line and marker color." },
    { name: "distance", type: "number", min: 0, max: 80, step: 2, default: 24, description: "Px entries slide up while fading in." },
  ],
  usage: `<Timeline
  scrollContainerRef={scrollerRef}
  items={[
    { date: "Jan 2025", title: "First commit", description: "Where it all began." },
    { date: "Jul 2025", title: "v1.0 launch" },
  ]}
/>`,
} satisfies Meta;
