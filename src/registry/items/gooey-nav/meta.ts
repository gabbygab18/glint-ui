import type { Meta } from "../../types";

export default {
  name: "Gooey Nav",
  category: "widgets",
  description: "A segmented tray where the active item pulls out on a liquid metaball thread and drops a bead when it snaps.",
  isNew: true,
  dependencies: ["motion", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "items", type: "list", control: false, description: "Labels, or `{ label, href, icon }` objects. Items with `href` render as links." },
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Palette the active pill wears." },
    { name: "size", type: "select", options: ["xs", "sm", "md", "lg"], default: "md", description: "Label size, with it the corner and the travel." },
    { name: "separation", type: "number", min: 4, max: 40, control: false, description: "Gap the pill opens on each side, in px (defaults per size)." },
    { name: "threshold", type: "number", min: 8, max: 40, step: 1, default: 19, description: "Alpha ramp slope: how hard the fused edge is." },
    { name: "gooey", type: "boolean", default: true, description: "Run the metaball fuse. Off, the surfaces just slide apart." },
    { name: "bead", type: "boolean", default: true, description: "Leave a drop of juice where the thread severs." },
    { name: "value", type: "number", min: 0, max: 10, control: false, description: "Active index (controlled)." },
    { name: "defaultValue", type: "number", min: 0, max: 10, default: 0, control: false, description: "Active index on mount when uncontrolled." },
    { name: "onChange", type: "node", description: "`(index) => void`, fired on selection." },
    { name: "radius", type: "number", min: 4, max: 32, control: false, description: "Override the corner radius in px." },
    { name: "viscosity", type: "number", min: 1, max: 30, control: false, description: "Fuse blur in px. Defaults to 0.55 of the gap." },
  ],
  usage: `<GooeyNav items={["Home", "Components", "Templates", "Docs"]} variant="calamansi" />`,
} satisfies Meta;
