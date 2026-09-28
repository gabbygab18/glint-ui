import type { Meta } from "../../types";

export default {
  name: "Dynamic Island",
  category: "widgets",
  description: "A squircle pill that eases into a slab when tapped, swaps its content on the way, and glows red on alert.",
  isNew: true,
  dependencies: ["motion", "figma-squircle", "react-use-measure"],
  credit: { label: "Calamansi UI", url: "https://github.com/fujiDevv/calamansi-ui", license: "MIT" },
  props: [
    { name: "variant", type: "select", options: ["calamansi", "white", "slate", "citrus"], default: "calamansi", description: "Surface palette." },
    { name: "pulse", type: "boolean", default: false, description: "Ambient pulse dot in compact and idle states." },
    { name: "interactive", type: "boolean", default: true, description: "Tap or Enter/Space toggles compact and expanded." },
    { name: "state", type: "select", options: ["idle", "compact", "expanded", "alert"], control: false, description: "Controlled state." },
    { name: "defaultState", type: "select", options: ["idle", "compact", "expanded", "alert"], default: "compact", control: false, description: "Initial state when uncontrolled." },
    { name: "onStateChange", type: "node", description: "`(state) => void`, fired when a tap asks to change state." },
    { name: "icon", type: "node", description: "Primary icon, shown in a chip tinted from the surface ink." },
    { name: "leading", type: "node", description: "Leading slot used when no `icon` is given." },
    { name: "title", type: "node", description: "Label in compact and alert states." },
    { name: "trailing", type: "node", description: "Trailing slot (timer, badge, waveform)." },
    { name: "expandedContent", type: "node", description: "Content shown when expanded." },
    { name: "label", type: "string", default: "Dynamic island", control: false, description: "Accessible name of the toggle." },
  ],
  usage: `<DynamicIsland
  icon={<Music2 className="size-3.5" />}
  title="Solaris · Citrus Beat"
  trailing={<span>2:48</span>}
  expandedContent={<Player />}
/>`,
} satisfies Meta;
