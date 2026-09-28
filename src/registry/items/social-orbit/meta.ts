import type { Meta } from "../../types";

export default {
  name: "Social Orbit",
  category: "components",
  description: "An avatar with social links circling it on two counter-rotating rings, upright icons, brand-colored hovers and tooltip labels; pauses on hover.",
  props: [
    { name: "avatar", type: "string", description: "Avatar image URL." },
    { name: "name", type: "string", control: false, description: "Person's name, used as the avatar alt text." },
    { name: "items", type: "node", description: "Array of { label, href, icon, color? }. First half orbits the inner ring." },
    { name: "innerRadius", type: "number", min: 60, max: 160, step: 5, default: 95, description: "Inner ring radius in px." },
    { name: "outerRadius", type: "number", min: 100, max: 240, step: 5, default: 160, description: "Outer ring radius in px." },
    { name: "speed", type: "number", min: 0, max: 4, step: 0.1, default: 1, description: "Orbit speed multiplier; 0 stops it." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Pause while hovered or focused." },
    { name: "showRings", type: "boolean", default: true, description: "Draw the dashed orbit paths." },
    { name: "accent", type: "color", default: "#a3e635", description: "Avatar halo and glow color." },
  ],
  usage: `<SocialOrbit
  avatar="/me.jpg"
  name="Ana Reyes"
  items={[
    { label: "GitHub", href: "https://github.com/ana", icon: <GitHubIcon />, color: "#6e40c9" },
    { label: "X", href: "https://x.com/ana", icon: <XIcon />, color: "#0f1419" },
  ]}
/>`,
} satisfies Meta;
