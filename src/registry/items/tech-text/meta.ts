import type { Meta } from "../../types";

export default {
  name: "Tech Text",
  category: "text-animations",
  description: "HUD-style lettering that flickers on inside bracket frames, with a scan line, live readouts and a blinking caret.",
  props: [
    { name: "text", type: "string", default: "Node online", description: "Main text." },
    { name: "label", type: "string", default: "SYS.07 // UPLINK", description: "Readout above the frame." },
    { name: "sublabel", type: "string", default: "SIGNAL LOCK", description: "Readout below the frame; a live % is appended." },
    { name: "color", type: "color", default: "#a3e635", description: "Accent for brackets, labels and glow." },
    { name: "speed", type: "number", min: 10, max: 200, step: 5, default: 45, description: "Ms between characters flickering on." },
    { name: "caret", type: "boolean", default: true, description: "Blinking block caret after the text." },
    { name: "replayOnHover", type: "boolean", default: true, description: "Replay the boot sequence on hover." },
  ],
  usage: `<TechText text="Node online" label="SYS.07 // UPLINK" className="font-mono text-5xl" />`,
} satisfies Meta;
