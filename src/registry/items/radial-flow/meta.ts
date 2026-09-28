import type { Meta } from "../../types";

export default {
  name: "Radial Flow",
  category: "components",
  description: "A hub-and-spoke diagram where glowing data pulses stream along curved links between a central node and its connected services.",
  props: [
    { name: "hub", type: "node", description: "Center node: { label, icon? }." },
    { name: "nodes", type: "node", description: "Array of { label, icon?, hint? } placed around the hub." },
    { name: "accent", type: "color", default: "#a3e635", description: "Pulse and highlight color." },
    { name: "duration", type: "number", min: 0.8, max: 8, step: 0.1, default: 2.6, description: "Seconds for one pulse to travel a link." },
    { name: "pulses", type: "number", min: 1, max: 4, step: 1, default: 1, description: "Pulses in flight per link." },
    { name: "direction", type: "select", options: ["both", "in", "out"], default: "both", description: "Which way data flows; both alternates per link." },
    { name: "curvature", type: "number", min: -0.5, max: 0.5, step: 0.01, default: 0.18, description: "How much links bow, as a fraction of their length." },
  ],
  usage: `<RadialFlow
  hub={{ label: "API Gateway", icon: <Zap /> }}
  nodes={[
    { label: "Postgres", hint: "Primary DB", icon: <Database /> },
    { label: "Stripe", hint: "Payments", icon: <CreditCard /> },
  ]}
/>`,
} satisfies Meta;
