import type { Meta } from "../../types";

export default {
  name: "Paper Crumple",
  category: "micro-interactions",
  description: "Deleting a note scrunches it into a paper ball that arcs into a bin, whose lid flips open and wobbles shut. Undo tosses it back out and smooths it flat.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "title", type: "string", default: "Grocery list", description: "Note title." },
    { name: "body", type: "string", default: "Oat milk, lemons, basil, the good sourdough, something for Sunday.", description: "Note text." },
    { name: "undoDuration", type: "number", min: 1500, max: 15000, step: 500, default: 5000, description: "Ms the Undo button stays available." },
    { name: "color", type: "color", default: "#f87171", description: "Undo accent color." },
    { name: "onDelete", type: "node", description: "Called when the undo window closes and the delete is final." },
    { name: "onUndo", type: "node", description: "Called when the note is restored." },
  ],
  usage: `<PaperCrumple
  title="Grocery list"
  body="Oat milk, lemons, basil…"
  onDelete={() => removeNote(id)}
/>`,
} satisfies Meta;
