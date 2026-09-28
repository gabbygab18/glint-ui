import type { Meta } from "../../types";

export default {
  name: "Keyboard",
  category: "widgets",
  description: "A realistic compact keyboard whose keycaps sink and glow with backlight when you press the matching physical keys or click them, with a live typing strip and caps-lock LED.",
  isNew: true,
  props: [
    { name: "size", type: "number", min: 24, max: 56, step: 1, default: 40, description: "Key unit in px (board is 15 units wide)." },
    { name: "accent", type: "color", default: "#c6ff3d", description: "Backlight color of pressed keys." },
    { name: "variant", type: "select", options: ["graphite", "silver"], default: "graphite", description: "Keycap and plate finish." },
    { name: "showDisplay", type: "boolean", default: true, description: "Show the typed-text strip." },
    { name: "global", type: "boolean", default: false, description: "Listen to the whole window, not just while focused." },
    { name: "onKey", type: "node", description: "`(code: string) => void` for every press, with the KeyboardEvent.code." },
  ],
  usage: `<Keyboard accent="#c6ff3d" onKey={(code) => console.log(code)} />`,
} satisfies Meta;
