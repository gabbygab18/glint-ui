import type { Meta } from "../../types";

export default {
  name: "Splash Cursor",
  category: "animations",
  description: "Real-time fluid ink that swirls off the cursor in shifting colors. A compact WebGL2 stable-fluids solver, scoped to its container.",
  props: [
    { name: "simResolution", type: "number", min: 32, max: 256, step: 16, default: 128, description: "Velocity grid size on the shorter side. Higher is finer and slower." },
    { name: "dyeResolution", type: "number", min: 128, max: 1024, step: 64, default: 512, description: "Ink texture size on the shorter side." },
    { name: "dissipation", type: "number", min: 0, max: 5, step: 0.1, default: 0.8, description: "How quickly ink fades, per second." },
    { name: "velocityDissipation", type: "number", min: 0, max: 4, step: 0.1, default: 0.4, description: "How quickly motion settles, per second." },
    { name: "curl", type: "number", min: 0, max: 60, step: 1, default: 20, description: "How much the ink curls into swirls." },
    { name: "splatRadius", type: "number", min: 0.05, max: 1, step: 0.05, default: 0.25, description: "Splat radius." },
    { name: "force", type: "number", min: 1000, max: 15000, step: 500, default: 6000, description: "How hard cursor motion pushes the ink." },
    { name: "idle", type: "boolean", default: true, description: "Throw random splashes while the cursor is away." },
  ],
  usage: `<div className="relative h-96">\n  <SplashCursor />\n</div>`,
} satisfies Meta;
