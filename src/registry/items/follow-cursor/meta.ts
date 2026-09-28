import type { Meta } from "../../types";

export default {
  name: "Follow Cursor",
  category: "animations",
  description: "A pill label that trails the cursor across a card on a spring, leans into motion and squishes on click.",
  props: [
    { name: "children", type: "node", description: "The area the label follows the cursor over." },
    { name: "label", type: "string", default: "View project", description: "Text on the pill." },
    { name: "stiffness", type: "number", min: 0.02, max: 0.5, step: 0.01, default: 0.12, description: "Spring pull toward the cursor." },
    { name: "damping", type: "number", min: 0.3, max: 0.95, step: 0.01, default: 0.7, description: "Velocity kept per frame. Higher is bouncier." },
    { name: "tilt", type: "boolean", default: true, description: "Lean the pill into horizontal motion." },
    { name: "hideCursor", type: "boolean", default: true, description: "Hide the system cursor over the area (mouse only)." },
  ],
  usage: `<FollowCursor label="View project" className="rounded-3xl">\n  <img src="/cover.jpg" alt="" />\n</FollowCursor>`,
} satisfies Meta;
