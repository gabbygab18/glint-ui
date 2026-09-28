import type { Meta } from "../../types";

export default {
  name: "Toggle Vault",
  category: "micro-interactions",
  description: "A lock switch styled as a vault door: the combination dial winds back, spins, and the bolts retract; locking spins it home and slams the bolts shut.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "size", type: "number", min: 96, max: 280, step: 8, default: 160, description: "Diameter in px." },
    { name: "defaultLocked", type: "boolean", default: true, description: "Start locked (uncontrolled)." },
    { name: "label", type: "string", default: "Vault", description: "Accessible name, announced as \"<label> lock\"." },
    { name: "openColor", type: "color", default: "#22c55e", description: "Indicator color when unlocked." },
    { name: "lockedColor", type: "color", default: "#ef4444", description: "Indicator color when locked." },
    { name: "locked", type: "node", description: "Controlled state. Pair with onChange(locked)." },
  ],
  usage: `<ToggleVault locked={locked} onChange={setLocked} />`,
} satisfies Meta;
