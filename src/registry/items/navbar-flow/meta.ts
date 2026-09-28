import type { Meta } from "../../types";

export default {
  name: "Navbar Flow",
  category: "components",
  description: "A full-width navbar that flows into a floating glass pill as you scroll, with a sliding hover highlight, scroll progress line and an animated mobile menu.",
  dependencies: ["motion"],
  props: [
    { name: "links", type: "node", description: "Array of { label, href }." },
    { name: "brand", type: "node", description: "Logo or wordmark on the left." },
    { name: "action", type: "node", description: "Call to action on the right." },
    { name: "scrollContainerRef", type: "node", description: "Ref to a scrolling ancestor. Defaults to the window." },
    { name: "threshold", type: "number", min: 0, max: 300, step: 10, default: 40, description: "Px scrolled before the bar becomes a pill." },
    { name: "pillWidth", type: "number", min: 360, max: 1100, step: 10, default: 720, description: "Max width of the floating pill, in px." },
    { name: "position", type: "select", options: ["sticky", "fixed", "absolute"], default: "sticky", description: "How the header is positioned." },
    { name: "progress", type: "boolean", default: true, description: "Scroll-progress line along the pill." },
    { name: "accent", type: "color", default: "#a3e635", description: "Progress line and active-link dot color." },
  ],
  usage: `<NavbarFlow
  brand={<Logo />}
  links={[{ label: "Product", href: "#product" }, { label: "Pricing", href: "#pricing" }]}
  action={<a href="/signup">Get started</a>}
/>`,
} satisfies Meta;
