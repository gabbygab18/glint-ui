import type { Meta } from "../../types";

export default {
  name: "Splitter",
  category: "components",
  description: "Resizable split panes with a draggable handle, min/max limits, and full keyboard resizing.",
  props: [
    { name: "start", type: "node", description: "First pane (left or top)." },
    { name: "end", type: "node", description: "Second pane (right or bottom)." },
    { name: "direction", type: "select", options: ["horizontal", "vertical"], default: "horizontal", description: "Side by side or stacked." },
    { name: "defaultSize", type: "number", min: 10, max: 90, step: 1, default: 28, description: "Initial size of the first pane, in %." },
    { name: "minSize", type: "number", min: 0, max: 50, step: 1, default: 15, description: "Smallest first pane, in %." },
    { name: "maxSize", type: "number", min: 50, max: 100, step: 1, default: 85, description: "Largest first pane, in %." },
    { name: "step", type: "number", min: 1, max: 20, step: 1, default: 5, description: "% per arrow key press (Shift = 4x)." },
    { name: "label", type: "string", default: "Resize panels", description: "Accessible name of the handle." },
    { name: "onResize", type: "node", description: "Called with the new size (%) after a drag or key press." },
  ],
  usage: `<Splitter
  defaultSize={30}
  minSize={15}
  maxSize={70}
  start={<Sidebar />}
  end={<Content />}
/>`,
} satisfies Meta;
