import type { Meta } from "../../types";

export default {
  name: "Text Loop",
  category: "text-animations",
  description: "Lines of text roll endlessly through a soft-masked window, the active line sharp and its neighbours blurred.",
  props: [
    {
      name: "items",
      type: "list",
      default: ["designers", "engineers", "founders", "storytellers", "dreamers"],
      description: "Lines to loop through.",
    },
    { name: "interval", type: "number", min: 600, max: 6000, step: 100, default: 2200, description: "Ms between steps." },
    { name: "duration", type: "number", min: 100, max: 2000, step: 50, default: 800, description: "Ms for one slide." },
    { name: "visibleLines", type: "number", min: 1, max: 5, step: 2, default: 3, description: "Lines visible in the window." },
    { name: "dimInactive", type: "boolean", default: true, description: "Blur and dim inactive lines." },
    { name: "align", type: "select", options: ["left", "center", "right"], default: "left", description: "Text alignment." },
  ],
  usage: `<p>Made for <TextLoop items={["designers", "engineers", "founders"]} /></p>`,
} satisfies Meta;
