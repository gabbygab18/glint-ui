import type { Meta } from "../../types";

export default {
  name: "Nudge Field",
  category: "micro-interactions",
  description: "A text field that answers a bad value with a quick damped shake, a destructive border and an error message that slides in below. Shakes again on every failed submit.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "intensity", type: "number", min: 2, max: 24, step: 1, default: 9, description: "Shake distance in px." },
    { name: "duration", type: "number", min: 0.2, max: 1, step: 0.05, default: 0.45, description: "Shake length in seconds." },
    { name: "error", type: "node", description: "Error message; the field shakes when it appears or changes." },
    { name: "attempt", type: "node", description: "Bump on each failed submit to shake again with the same error." },
  ],
  usage: `<NudgeField
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  attempt={attempts}
/>`,
} satisfies Meta;
