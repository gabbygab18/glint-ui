import type { Meta } from "../../types";

export default {
  name: "Radial Socials",
  category: "components",
  description: "A share button that fans social links out along a radial arc with a staggered spring, a drawn guide arc and brand-colored hovers.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "items", type: "node", description: "Array of { label, href, icon, color? }." },
    { name: "radius", type: "number", min: 60, max: 200, step: 5, default: 120, description: "Distance from the button to each icon, in px." },
    { name: "angle", type: "number", min: -180, max: 180, step: 5, default: -90, description: "Direction the arc faces in degrees (-90 is up)." },
    { name: "spread", type: "number", min: 60, max: 360, step: 10, default: 180, description: "Arc width in degrees; 360 is a full ring." },
    { name: "stagger", type: "number", min: 0, max: 0.2, step: 0.01, default: 0.05, description: "Seconds between icons springing out." },
    { name: "defaultOpen", type: "boolean", control: false, description: "Start opened (default false)." },
    { name: "guide", type: "boolean", default: true, description: "Faint dashed guide arc behind the icons." },
    { name: "label", type: "string", default: "Share", description: "Accessible label of the center button." },
  ],
  usage: `<RadialSocials
  items={[
    { label: "X", href: "https://x.com", icon: <XIcon />, color: "#000" },
    { label: "GitHub", href: "https://github.com", icon: <GitHubIcon />, color: "#24292f" },
  ]}
/>`,
} satisfies Meta;
