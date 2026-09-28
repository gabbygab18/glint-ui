import type { Meta } from "../../types";

export default {
  name: "Expandable Cards",
  category: "components",
  description: "A list of cards where the one you pick morphs into a detail view with a shared-layout spring, closing on Escape or backdrop click.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { id, title, subtitle, image, content, cta?, onCta? }." },
    { name: "radius", type: "number", min: 0, max: 32, step: 1, default: 20, description: "Corner radius in px." },
    { name: "bounce", type: "number", min: 0, max: 0.5, step: 0.05, default: 0.15, description: "Spring bounce of the morph." },
    { name: "backdrop", type: "boolean", default: true, description: "Dim and blur the list behind the open card." },
  ],
  usage: `<ExpandableCards
  items={[
    { id: "tides", title: "Tides", subtitle: "38 min listen", image: "/tides.jpg", content: <p>…</p>, cta: "Play" },
  ]}
/>`,
} satisfies Meta;
