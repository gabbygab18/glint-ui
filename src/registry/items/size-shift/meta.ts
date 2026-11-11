import type { Meta } from "../../types";

export default {
  name: "Size Shift",
  category: "components",
  description: "A box that glides to the size of whatever is inside it. Swap the content and the card eases to its new width and height on a spring while the new content fades up from a blur.",
  dependencies: ["motion", "react-use-measure"],
  isNew: true,
  props: [
    { name: "axis", type: "select", options: ["both", "height"], default: "both", description: "Which sides follow the content." },
    { name: "bounce", type: "number", min: 0, max: 0.6, step: 0.02, default: 0.18, description: "Spring bounce." },
    { name: "duration", type: "number", min: 0.15, max: 1.2, step: 0.05, default: 0.45, description: "Resize length in seconds." },
    { name: "contentKey", type: "node", description: "Change it with the content to fade the new content in." },
  ],
  usage: `<SizeShift contentKey={step} className="rounded-2xl border bg-card">
  {step === "review" ? <ReviewList /> : <UploadPrompt />}
</SizeShift>`,
} satisfies Meta;
