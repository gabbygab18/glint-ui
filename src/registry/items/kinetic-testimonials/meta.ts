import type { Meta } from "../../types";

export default {
  name: "Kinetic Testimonials",
  category: "components",
  description: "Rows of testimonial cards drifting in opposite directions, pausing on hover with soft edge fades.",
  props: [
    { name: "testimonials", type: "node", description: "Array of { quote, name, title?, avatar?, rating? }." },
    { name: "rows", type: "number", min: 1, max: 4, step: 1, default: 2, description: "Number of rows, alternating direction." },
    { name: "duration", type: "number", min: 10, max: 160, step: 5, default: 60, description: "Seconds per loop for the first row." },
    { name: "cardWidth", type: "number", min: 220, max: 440, step: 10, default: 320, description: "Card width in px." },
    { name: "gap", type: "number", min: 4, max: 40, step: 2, default: 16, description: "Px between cards and rows." },
    { name: "tilt", type: "number", min: -10, max: 10, step: 0.5, default: -3, description: "Rotation of the band in degrees." },
    { name: "pauseOnHover", type: "boolean", default: true, description: "Pause a row and spotlight the hovered card." },
    { name: "fadeEdges", type: "boolean", default: true, description: "Fade cards out at the edges." },
  ],
  usage: `<KineticTestimonials
  testimonials={[
    { quote: "Shipped our redesign in a week.", name: "Ana Ruiz", title: "Design lead, Acme", avatar: "/ana.jpg", rating: 5 },
  ]}
/>`,
} satisfies Meta;
