import type { Meta } from "../../types";

export default {
  name: "Feature Showcase",
  category: "components",
  description: "Feature list with an expanding description and a filling progress bar that auto-advances, crossfading a matching visual on the side.",
  isNew: true,
  props: [
    { name: "interval", type: "number", min: 1500, max: 12000, step: 500, default: 5000, description: "Milliseconds each feature stays active." },
    { name: "autoPlay", type: "boolean", default: true, description: "Advance to the next feature automatically." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Pause while the pointer or keyboard focus is inside." },
    { name: "reverse", type: "boolean", default: false, description: "Put the visual on the left." },
    { name: "features", type: "node", description: "Array of { title, description, icon?, visual }." },
    { name: "defaultIndex", type: "node", description: "Feature active on first render (number, default 0)." },
    { name: "onChange", type: "node", description: "Called with the new active index." },
  ],
  usage: `<FeatureShowcase
  interval={5000}
  features={[
    { title: "Realtime analytics", icon: <ChartNoAxesColumn />, description: "Live numbers.", visual: <img src="/analytics.png" alt="" /> },
    { title: "Team inbox", icon: <MessagesSquare />, description: "Reply together.", visual: <img src="/inbox.png" alt="" /> },
  ]}
/>`,
} satisfies Meta;
