import type { Meta } from "../../types";

export default {
  name: "Stepper",
  category: "components",
  description: "Multi-step flow with a filling progress track, pulsing active step, sliding content that resizes smoothly and a completion state.",
  dependencies: ["motion", "react-use-measure"],
  props: [
    { name: "children", type: "node", description: "`<Step title>` elements, one per step." },
    { name: "initialStep", type: "number", min: 1, max: 4, step: 1, default: 1, control: false, description: "1-based step to start on." },
    { name: "accentColor", type: "color", default: "#c6ff3d", description: "Active and completed color." },
    { name: "accentForeground", type: "color", default: "#0a0a0a", description: "Text and icon color on the accent." },
    { name: "backText", type: "string", default: "Back", description: "Back button label." },
    { name: "nextText", type: "string", default: "Continue", description: "Next button label." },
    { name: "completeText", type: "string", default: "Complete", description: "Last button label." },
    { name: "clickableSteps", type: "boolean", default: true, description: "Jump to a step by clicking its dot." },
    { name: "completedContent", type: "node", description: "Shown after the last step is completed." },
    { name: "onStepChange", type: "node", description: "(step: number) => void" },
    { name: "onComplete", type: "node", description: "() => void" },
  ],
  usage: `<Stepper onComplete={() => save()}>
  <Step title="Account">…</Step>
  <Step title="Plan">…</Step>
  <Step title="Review">…</Step>
</Stepper>`,
} satisfies Meta;
