import type { Meta } from "../../types";

export default {
  name: "Status",
  category: "primitives",
  description: "Presence indicator (online, away, busy, offline): a colored dot with rippling rings, an optional tinted pill and a soft crossfade when the status changes.",
  isNew: true,
  props: [
    { name: "status", type: "select", options: ["online", "away", "busy", "offline"], default: "online", description: "Presence state." },
    { name: "variant", type: "select", options: ["pill", "plain"], default: "pill", description: "Tinted capsule or dot + text." },
    { name: "size", type: "select", options: ["sm", "md"], default: "md", description: "Text and dot size." },
    { name: "label", type: "string", description: "Custom text (defaults to the status name)." },
    { name: "hideLabel", type: "boolean", default: false, description: "Dot only; label kept for screen readers." },
    { name: "pulse", type: "boolean", description: "Ripple rings. Defaults to on for online and busy." },
  ],
  usage: `<Status status="online" />
<Status status="busy" label="In a meeting" variant="plain" />`,
} satisfies Meta;
