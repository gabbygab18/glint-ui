import type { Meta } from "../../types";

export default {
  name: "Stripe Button",
  category: "buttons",
  description: "Diagonal barber stripes that brighten and scroll on hover, like a live progress bar.",
  isNew: true,
  props: [
    { name: "children", type: "node", description: "Button label." },
    { name: "stripeSize", type: "number", min: 8, max: 48, step: 2, default: 18, description: "Stripe tile size in px." },
    { name: "speed", type: "number", min: 0.1, max: 3, step: 0.1, default: 0.5, description: "Seconds for the stripes to scroll one tile." },
  ],
  usage: `<StripeButton speed={0.5}>Deploy now</StripeButton>`,
} satisfies Meta;
