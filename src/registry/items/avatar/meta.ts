import type { Meta } from "../../types";

export default {
  name: "Avatar",
  category: "primitives",
  description: "Profile picture that fades in once loaded, falls back to colorful initials, and shows an optional presence dot.",
  isNew: true,
  props: [
    { name: "src", type: "string", description: "Image URL. Falls back to initials while loading or on error." },
    { name: "name", type: "string", description: "Person's name: accessible label and initials." },
    { name: "size", type: "select", options: ["sm", "md", "lg", "xl"], default: "md", description: "32, 40, 56 or 80 px." },
    { name: "shape", type: "select", options: ["circle", "square"], default: "circle", description: "Round or squircle-ish corners." },
    { name: "status", type: "select", options: ["online", "away", "busy", "offline"], control: false, description: "Presence dot; online pulses." },
  ],
  usage: `<Avatar src="/maya.jpg" name="Maya Chen" status="online" size="lg" />`,
} satisfies Meta;
