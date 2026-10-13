import type { Meta } from "../../types";

export default {
  name: "Burn Button",
  category: "buttons",
  description: "Hold to light a spark that burns along the border; if it makes it all the way round, it bursts. Works with Space and Enter.",
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "duration", type: "number", min: 400, max: 5000, step: 100, default: 1600, description: "Ms the button must be held." },
    { name: "color", type: "color", default: "#fb923c", description: "Spark and burst color." },
    { name: "onComplete", type: "node", description: "Called once the fuse finishes burning." },
  ],
  usage: `<BurnButton onComplete={() => launch()}>Hold to launch</BurnButton>`,
} satisfies Meta;
