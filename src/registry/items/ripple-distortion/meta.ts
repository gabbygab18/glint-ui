import type { Meta } from "../../types";

export default {
  name: "Ripple Distortion",
  category: "animations",
  description: "An image that ripples like a water surface wherever the cursor passes, with a hint of chromatic split. WebGL.",
  props: [
    { name: "src", type: "string", description: "Image URL. Must be CORS-enabled.", control: false },
    { name: "alt", type: "string", control: false, description: "Accessible description of the image." },
    { name: "strength", type: "number", min: 0, max: 40, step: 1, default: 8, description: "Peak displacement in px." },
    { name: "speed", type: "number", min: 60, max: 800, step: 10, default: 260, description: "Px per second the rings travel." },
    { name: "wavelength", type: "number", min: 10, max: 100, step: 2, default: 34, description: "Px between wave crests." },
    { name: "lifetime", type: "number", min: 0.5, max: 6, step: 0.1, default: 2.5, description: "Seconds before a ripple dies out." },
  ],
  usage: `<RippleDistortion src="/lake.jpg" alt="A mountain lake" className="h-96 w-full rounded-3xl" />`,
} satisfies Meta;
