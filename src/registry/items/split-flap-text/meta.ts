import type { Meta } from "../../types";

export default {
  name: "Split Flap Text",
  category: "text-animations",
  description: "An airport departures board: every tile flips through the drum until it lands on the next word.",
  props: [
    {
      name: "words",
      type: "list",
      default: ["Departures", "Boarding", "Tokyo 08:45", "On time"],
      description: "Words to cycle through.",
    },
    { name: "interval", type: "number", min: 1500, max: 10000, step: 100, default: 4200, description: "Ms between words." },
    { name: "flipDuration", type: "number", min: 30, max: 300, step: 5, default: 55, description: "Ms for one flap to fall." },
    { name: "stagger", type: "number", min: 0, max: 200, step: 5, default: 40, description: "Ms between tiles starting." },
    { name: "align", type: "select", options: ["left", "center"], default: "center", description: "Where shorter words sit." },
    { name: "tileColor", type: "color", default: "#1b1b1f", description: "Flap background." },
    { name: "textColor", type: "color", default: "#f5f5f0", description: "Character color." },
  ],
  usage: `<SplitFlapText words={["Departures", "Boarding", "On time"]} />`,
} satisfies Meta;
