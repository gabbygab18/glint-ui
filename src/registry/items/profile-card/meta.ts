import type { Meta } from "../../types";

export default {
  name: "Profile Card",
  category: "components",
  description: "Holographic profile card that tilts toward the pointer while rainbow foil, glitter and glare slide across it, with a glass contact bar.",
  props: [
    { name: "name", type: "string", default: "Maya Laurent", description: "Display name." },
    { name: "title", type: "string", default: "Product Designer", description: "Role under the name." },
    { name: "handle", type: "string", default: "mayalaurent", description: "Handle shown in the contact bar, without @." },
    { name: "status", type: "string", default: "Available for work", description: "Status line with a live dot." },
    { name: "contactText", type: "string", default: "Contact", description: "Button label." },
    { name: "maxTilt", type: "number", min: 0, max: 30, step: 1, default: 14, description: "Max tilt in degrees." },
    { name: "foil", type: "number", min: 0, max: 1, step: 0.05, default: 0.8, description: "Strength of the holographic foil." },
    { name: "showUserInfo", type: "boolean", default: true, description: "Show the bottom contact bar." },
    { name: "avatarUrl", type: "node", description: "Portrait that fills the card." },
    { name: "miniAvatarUrl", type: "node", description: "Small avatar in the contact bar. Defaults to avatarUrl." },
    { name: "onContactClick", type: "node", description: "() => void" },
  ],
  usage: `<ProfileCard
  name="Maya Laurent"
  title="Product Designer"
  handle="mayalaurent"
  avatarUrl="/maya.jpg"
  onContactClick={() => openChat()}
/>`,
} satisfies Meta;
