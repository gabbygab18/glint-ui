import type { Meta } from "../../types";

export default {
  name: "Animated Testimonials",
  category: "components",
  description: "A stack of tilted photo cards that shuffles to the active person while their quote blurs in word by word.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "testimonials", type: "node", description: "Array of { quote, name, role, src }." },
    { name: "autoplay", type: "boolean", default: true, description: "Advance automatically; pauses on hover or focus." },
    { name: "interval", type: "number", min: 2000, max: 12000, step: 500, default: 5000, description: "Ms between slides." },
    { name: "wordDelay", type: "number", min: 0, max: 0.15, step: 0.01, default: 0.03, description: "Seconds between words appearing." },
  ],
  usage: `<AnimatedTestimonials
  testimonials={[
    { quote: "Shipped in a weekend.", name: "Maya Chen", role: "Head of Product", src: "/maya.jpg" },
  ]}
/>`,
} satisfies Meta;
