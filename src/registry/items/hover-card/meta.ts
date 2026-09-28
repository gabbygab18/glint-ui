import type { Meta } from "../../types";

export default {
  name: "Hover Card",
  category: "primitives",
  description: "Rich preview card that blooms out of a link on hover or focus, with open/close delays, an arrow, smart flipping and a top-layer render.",
  isNew: true,
  props: [
    { name: "openDelay", type: "number", min: 0, max: 1500, step: 50, default: 500, description: "HoverCard: ms of hover/focus before opening." },
    { name: "closeDelay", type: "number", min: 0, max: 1000, step: 50, default: 250, description: "HoverCard: ms before closing after leaving." },
    { name: "side", type: "select", options: ["bottom", "top", "right", "left"], default: "bottom", description: "Content: preferred side (flips when there is no room)." },
    { name: "align", type: "select", options: ["center", "start", "end"], default: "center", description: "Content: alignment along the trigger." },
    { name: "sideOffset", type: "number", min: 0, max: 32, step: 1, default: 10, description: "Content: gap to the trigger in px." },
    { name: "arrow", type: "boolean", default: true, description: "Content: arrow pointing at the trigger." },
    { name: "open", type: "node", description: "HoverCard: controlled open state (with onOpenChange), or defaultOpen." },
  ],
  usage: `<HoverCard>
  <HoverCardTrigger href="/u/mira">@mira</HoverCardTrigger>
  <HoverCardContent side="bottom">...</HoverCardContent>
</HoverCard>`,
} satisfies Meta;
