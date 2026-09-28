import type { Meta } from "../../types";

export default {
  name: "Separator",
  category: "primitives",
  description: "Horizontal or vertical divider with an optional centered label, a primary gradient variant and a draw-in animation that grows outward from the label.",
  isNew: true,
  props: [
    { name: "label", type: "string", default: "", description: "Text centered on the line (empty for none)." },
    { name: "variant", type: "select", options: ["solid", "dashed", "gradient"], default: "solid", description: "Line style." },
    { name: "animated", type: "boolean", default: false, description: "Draw the line in on mount." },
    { name: "orientation", type: "select", options: ["horizontal", "vertical"], default: "horizontal", control: false, description: "Line direction. Vertical fills its parent's height." },
    { name: "decorative", type: "boolean", default: true, control: false, description: "role=\"none\" when true, otherwise role=\"separator\"." },
  ],
  usage: `<Separator />
<Separator label="or" variant="gradient" animated />
<Separator orientation="vertical" />`,
} satisfies Meta;
