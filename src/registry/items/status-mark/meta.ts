import type { Meta } from "../../types";

export default {
  name: "Status Mark",
  category: "micro-interactions",
  description: "One status icon that morphs between idle dot, spinning arc, a ring that closes into a popping check, and a shaking cross.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "status", type: "select", options: ["idle", "loading", "success", "error"], default: "idle", description: "Current state. The demo's Deploy button cycles it." },
    { name: "size", type: "number", min: 16, max: 128, step: 2, default: 48, description: "Diameter in px." },
    { name: "successColor", type: "color", default: "#22c55e", description: "Success color." },
    { name: "errorColor", type: "color", default: "#ef4444", description: "Error color." },
    { name: "labels", type: "node", description: "Screen-reader text per status, e.g. { success: \"Saved\" }." },
  ],
  usage: `<StatusMark status={saving ? "loading" : error ? "error" : saved ? "success" : "idle"} />`,
} satisfies Meta;
