import type { Meta } from "../../types";

export default {
  name: "Theme Toggle",
  category: "micro-interactions",
  description: "A day/night switch: the sun rolls across, its rays retract as a shadow bites it into a crescent, clouds drift off and stars burst out and twinkle.",
  dependencies: ["motion"],
  isNew: true,
  props: [
    { name: "size", type: "number", min: 20, max: 72, step: 2, default: 32, description: "Track height in px; width is double." },
    { name: "label", type: "string", default: "Dark mode", description: "Accessible label of the switch." },
    { name: "defaultChecked", type: "boolean", default: false, description: "Start in dark mode (uncontrolled)." },
    { name: "checked", type: "node", description: "Controlled state, true = dark. Pair with onChange(dark)." },
  ],
  usage: `const { resolvedTheme, setTheme } = useTheme();

<ThemeToggle
  checked={resolvedTheme === "dark"}
  onChange={(dark) => setTheme(dark ? "dark" : "light")}
/>`,
} satisfies Meta;
