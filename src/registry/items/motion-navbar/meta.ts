import type { Meta } from "../../types";

export default {
  name: "Motion Navbar",
  category: "components",
  description: "Site navbar with a hover pill that glides between links and a single dropdown that morphs its size and position between menus.",
  dependencies: ["motion", "react-use-measure"],
  props: [
    { name: "items", type: "node", description: "Array of { label, href?, content? }; items with content open the dropdown." },
    { name: "logo", type: "node", description: "Left slot, usually the brand." },
    { name: "actions", type: "node", description: "Right slot, usually buttons." },
    { name: "bounce", type: "number", min: 0, max: 0.5, step: 0.05, default: 0.15, description: "Spring bounce of the glide and morph." },
    { name: "duration", type: "number", min: 0.15, max: 1, step: 0.05, default: 0.4, description: "Seconds for the glide and morph." },
    { name: "closeDelay", type: "number", min: 0, max: 600, step: 25, default: 150, description: "Ms before the dropdown closes after leaving." },
  ],
  usage: `<MotionNavbar
  logo={<Logo />}
  items={[
    { label: "Products", content: <ProductsMenu /> },
    { label: "Resources", content: <ResourcesMenu /> },
    { label: "Pricing", href: "/pricing" },
  ]}
  actions={<Button>Get started</Button>}
/>`,
} satisfies Meta;
