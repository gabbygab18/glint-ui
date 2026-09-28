import type { Meta } from "../../types";

export default {
  name: "Call Chip",
  category: "micro-interactions",
  description: "An incoming-call pill with pulsing rings that expands into accept and decline, then morphs into a live call timer.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "name", type: "string", default: "Maya Chen", description: "Caller name." },
    { name: "subtitle", type: "string", default: "Incoming call", description: "Line under the name while ringing." },
    { name: "acceptColor", type: "color", default: "#22c55e", description: "Accept button and live-call accent." },
    { name: "declineColor", type: "color", default: "#ef4444", description: "Decline and hang-up color." },
    { name: "resetDelay", type: "number", min: 0, max: 8000, step: 250, default: 2500, description: "Ms after ending before it rings again (0 = stay ended)." },
    { name: "avatar", type: "node", description: "Optional avatar image URL; initials are used otherwise." },
    { name: "onAccept", type: "node", description: "Called when the call is accepted." },
    { name: "onDecline", type: "node", description: "Called when the call is declined." },
    { name: "onEnd", type: "node", description: "Called with the call length in seconds after hanging up." },
  ],
  usage: `<CallChip
  name="Maya Chen"
  onAccept={() => join()}
  onDecline={() => reject()}
  onEnd={(seconds) => log(seconds)}
/>`,
} satisfies Meta;
