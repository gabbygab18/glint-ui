import type { Meta } from "../../types";

export default {
  name: "Code Slots",
  category: "micro-interactions",
  description: "A one-time code input where each digit spins in like a slot reel, shakes on a wrong code and glows on success.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "length", type: "number", min: 4, max: 8, step: 1, default: 6, description: "Number of digits." },
    { name: "successColor", type: "color", default: "#22c55e", description: "Glow color on success." },
    { name: "errorColor", type: "color", default: "#ef4444", description: "Border color on a wrong code." },
    { name: "label", type: "string", default: "Verification code", description: "Accessible label of the input." },
    { name: "onComplete", type: "node", description: "(code) => boolean | Promise<boolean>. true glows, false shakes and clears." },
    { name: "onChange", type: "node", description: "Called with the digits typed so far." },
  ],
  usage: `<CodeSlots
  length={6}
  onComplete={async (code) => (await verify(code)).ok}
/>`,
} satisfies Meta;
