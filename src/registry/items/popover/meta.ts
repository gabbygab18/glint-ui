import type { Meta } from "../../types";

export default {
  name: "Popover",
  category: "primitives",
  description: "Anchored popover on the native Popover API: top-layer, light dismiss and Escape for free, smart flipping, an arrow and a spring scale-in from the trigger.",
  isNew: true,
  props: [
    { name: "side", type: "select", options: ["bottom", "top", "right", "left"], default: "bottom", description: "Preferred side (flips when there is no room)." },
    { name: "align", type: "select", options: ["center", "start", "end"], default: "center", description: "Alignment along the trigger." },
    { name: "sideOffset", type: "number", min: 0, max: 32, step: 1, default: 10, description: "Gap to the trigger in px." },
    { name: "arrow", type: "boolean", default: true, description: "Arrow pointing at the trigger." },
    { name: "open", type: "node", description: "Popover root: controlled open state (with onOpenChange), or defaultOpen." },
    { name: "children", type: "node", description: "Popover > PopoverTrigger + PopoverContent (+ PopoverClose)." },
  ],
  usage: `<Popover>
  <PopoverTrigger>Share</PopoverTrigger>
  <PopoverContent side="bottom" align="center">
    ...
    <PopoverClose>Done</PopoverClose>
  </PopoverContent>
</Popover>`,
} satisfies Meta;
