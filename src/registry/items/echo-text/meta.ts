import type { Meta } from "../../types";

export default {
  name: "Echo Text",
  category: "text-animations",
  description: "A headline trailed by fading echo copies that lag behind it, drifting on a loop or chasing the pointer.",
  props: [
    { name: "text", type: "string", default: "ECHO", description: "Text to echo." },
    { name: "echoes", type: "number", min: 1, max: 16, step: 1, default: 7, description: "Number of trailing copies." },
    { name: "lag", type: "number", min: 0.04, max: 0.6, step: 0.02, default: 0.1, description: "How fast each echo catches up; lower is a longer trail." },
    { name: "mode", type: "select", options: ["loop", "pointer"], default: "loop", description: "Drift on a loop, or follow the pointer." },
    { name: "amplitude", type: "number", min: 0, max: 160, step: 5, default: 60, description: "Maximum travel of the lead text, in px." },
    { name: "color", type: "color", default: "#fafafa", description: "Lead text color." },
    { name: "echoColor", type: "color", default: "#a3e635", description: "Echo color." },
    { name: "outline", type: "boolean", default: true, description: "Draw echoes as outlines instead of solid copies." },
  ],
  usage: `<EchoText text="ECHO" mode="pointer" className="text-8xl font-black" />`,
} satisfies Meta;
