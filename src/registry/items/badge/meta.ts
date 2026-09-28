import type { Meta } from "../../types";

export default {
  name: "Badge",
  category: "primitives",
  description: "Compact status label in six variants with an optional live dot, pulse ring and a glinting shine sweep.",
  isNew: true,
  props: [
    { name: "children", type: "string", default: "Live", description: "Badge text." },
    { name: "variant", type: "select", options: ["default", "secondary", "outline", "success", "warning", "destructive"], default: "default", description: "Color scheme." },
    { name: "size", type: "select", options: ["sm", "md"], default: "md", description: "Height 20 or 24 px." },
    { name: "dot", type: "boolean", default: false, description: "Leading status dot." },
    { name: "pulse", type: "boolean", default: false, description: "Pulsing ring on the dot (implies dot)." },
    { name: "shine", type: "boolean", default: false, description: "Periodic light sweep." },
  ],
  usage: `<Badge variant="success" pulse>Operational</Badge>`,
} satisfies Meta;
