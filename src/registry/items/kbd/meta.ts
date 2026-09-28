import type { Meta } from "../../types";

export default {
  name: "Kbd",
  category: "primitives",
  description: "Keyboard keys drawn as 3D keycaps that physically sink when the matching key is pressed, plus a group for shortcuts.",
  isNew: true,
  props: [
    { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md", description: "Keycap size." },
    { name: "listen", type: "boolean", default: true, description: "Animate a press when the matching physical key goes down." },
    { name: "match", type: "node", description: "KeyboardEvent.key to react to. Defaults to the text (\"⌘\", \"Shift\", \"Esc\", \"Mod\" = ⌘ on Mac, Ctrl elsewhere)." },
    { name: "pressed", type: "node", description: "Force the pressed look (boolean)." },
    { name: "children", type: "node", description: "Key label. KbdGroup takes Kbd children and an optional separator." },
  ],
  usage: `<KbdGroup separator="+">
  <Kbd>Mod</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>

<Kbd size="sm">Esc</Kbd>`,
} satisfies Meta;
