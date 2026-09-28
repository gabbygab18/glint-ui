import type { Meta } from "../../types";

export default {
  name: "Stats Carousel",
  category: "components",
  description: "A carousel of KPI cards whose numbers count up and sparklines draw in as each one slides to center.",
  props: [
    { name: "stats", type: "node", description: "Array of { label, value, prefix?, suffix?, decimals?, delta?, invert?, data, caption? }." },
    { name: "autoPlay", type: "boolean", default: true, description: "Advance automatically; pauses on hover and focus." },
    { name: "interval", type: "number", min: 1500, max: 8000, step: 100, default: 3200, description: "Ms between slides." },
    { name: "duration", type: "number", min: 300, max: 3000, step: 100, default: 1400, description: "Ms for the count-up and sparkline draw." },
    { name: "cardWidth", type: "number", min: 200, max: 400, step: 10, default: 280, description: "Card width in px." },
    { name: "gap", type: "number", min: 0, max: 60, step: 2, default: 20, description: "Px between cards." },
    { name: "positiveColor", type: "color", default: "#a3e635", description: "Accent for metrics moving the right way." },
    { name: "negativeColor", type: "color", default: "#fb7185", description: "Accent for metrics moving the wrong way." },
  ],
  usage: `<StatsCarousel
  stats={[
    { label: "Revenue", value: 48290, prefix: "$", delta: 12.4, data: [22, 27, 26, 34, 41, 44] },
    { label: "Churn", value: 1.9, decimals: 1, suffix: "%", delta: -0.6, invert: true, data: [2.8, 2.4, 2.2, 1.9] },
  ]}
/>`,
} satisfies Meta;
