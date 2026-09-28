import type { Meta } from "../../types";

export default {
  name: "Swipe Toast",
  category: "micro-interactions",
  description: "Stacked toasts that fan out on hover, pause their progress timers while you read, and fling away when swiped sideways.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    {
      name: "position",
      type: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
      default: "bottom-right",
      description: "Corner the stack is anchored to.",
    },
    { name: "strategy", type: "select", options: ["absolute", "fixed"], default: "absolute", description: "absolute stays inside the nearest positioned parent; fixed uses the viewport." },
    { name: "duration", type: "number", min: 0, max: 15000, step: 500, default: 5000, description: "Ms before auto-dismiss. 0 = until swiped." },
    { name: "visible", type: "number", min: 1, max: 6, step: 1, default: 3, description: "Toasts peeking out of the collapsed stack." },
    { name: "gap", type: "number", min: 0, max: 24, step: 1, default: 10, description: "Px between toasts when expanded." },
    { name: "toasts", type: "node", description: "Array of { id, title, description?, tone? }. useSwipeToast() manages one for you." },
    { name: "onDismiss", type: "node", description: "Called with the id when a toast is swiped, closed or times out." },
  ],
  usage: `const { toasts, push, dismiss } = useSwipeToast();

<button onClick={() => push({ title: "Saved", tone: "success" })}>Save</button>
<SwipeToast toasts={toasts} onDismiss={dismiss} position="bottom-right" />`,
} satisfies Meta;
