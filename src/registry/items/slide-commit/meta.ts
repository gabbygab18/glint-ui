import type { Meta } from "../../types";

export default {
  name: "Slide Commit",
  category: "micro-interactions",
  description: "Slide-to-confirm track: the knob stretches as you fling it, commits past the threshold with a popping check, and springs home with a wobble if you let go early.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "label", type: "string", default: "Slide to confirm", description: "Track label." },
    { name: "confirmedLabel", type: "string", default: "Confirmed", description: "Label after committing." },
    { name: "color", type: "color", default: "#22c55e", description: "Fill color." },
    { name: "threshold", type: "number", min: 0.5, max: 1, step: 0.05, default: 0.9, description: "Fraction of the track to pass to commit on release." },
    { name: "resetAfter", type: "number", min: 0, max: 10000, step: 250, default: 2500, description: "Ms before resetting after commit; 0 stays committed." },
    { name: "onCommit", type: "node", description: "Called once the knob reaches the end." },
  ],
  usage: `<SlideCommit label="Slide to pay" confirmedLabel="Paid" onCommit={() => pay(invoice.id)} />`,
} satisfies Meta;
