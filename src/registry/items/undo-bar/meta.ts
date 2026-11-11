import type { Meta } from "../../types";

export default {
  name: "Undo Bar",
  category: "micro-interactions",
  description: "A snackbar for reversible actions: it springs up after a delete while a ring counts down the seconds left to undo. Hovering or focusing it pauses the clock.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "duration", type: "number", min: 2, max: 15, step: 1, default: 5, description: "Seconds before the action is final." },
    { name: "actionLabel", type: "string", default: "Undo", description: "Undo button text." },
    { name: "open", type: "node", description: "Show the bar; reopening restarts the countdown." },
    { name: "message", type: "node", description: "What just happened." },
    { name: "onUndo", type: "node", description: "() => void, called on Undo." },
    { name: "onExpire", type: "node", description: "() => void, called when time runs out." },
    { name: "position", type: "node", description: '"fixed" (default) or "absolute" to stay inside a container.' },
  ],
  usage: `<UndoBar
  open={!!deleted}
  message="Message deleted"
  onUndo={restore}
  onExpire={commitDelete}
/>`,
} satisfies Meta;
