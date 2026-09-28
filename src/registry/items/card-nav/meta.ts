import type { Meta } from "../../types";

export default {
  name: "Card Nav",
  category: "components",
  description: "A compact navbar that springs open downward into a row of colorful link cards.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { label, links: { label, href }[], bgColor?, textColor? }." },
    { name: "logo", type: "node", description: "Centered logo." },
    { name: "ctaLabel", type: "string", default: "Get started", description: "Call-to-action label. Empty hides it." },
    { name: "ctaHref", type: "string", default: "#", control: false, description: "Call-to-action link." },
    { name: "barHeight", type: "number", min: 48, max: 80, step: 2, default: 60, description: "Closed bar height in px." },
    { name: "cardHeight", type: "number", min: 120, max: 320, step: 10, default: 200, description: "Card height in px." },
    { name: "stagger", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.08, description: "Seconds between cards." },
    { name: "defaultOpen", type: "boolean", default: false, control: false, description: "Start expanded." },
  ],
  usage: `<CardNav
  logo={<span>acme</span>}
  items={[
    { label: "Product", bgColor: "#1e1b4b", textColor: "#fff", links: [{ label: "Features", href: "/features" }] },
  ]}
/>`,
} satisfies Meta;
