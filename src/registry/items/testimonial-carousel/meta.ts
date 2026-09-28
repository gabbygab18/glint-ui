import type { Meta } from "../../types";

export default {
  name: "Testimonial Carousel",
  category: "components",
  description: "One testimonial at a time with avatar, star rating and quote. Swipe, arrows, dots, and auto-play that pauses on hover.",
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "testimonials", type: "node", description: "Array of { quote, name, role, avatar, rating? }." },
    { name: "autoPlay", type: "boolean", default: true, description: "Advance automatically; pauses on hover and focus." },
    { name: "interval", type: "number", min: 2000, max: 12000, step: 500, default: 5000, description: "Ms each testimonial stays on screen." },
    { name: "swipeThreshold", type: "number", min: 20, max: 200, step: 5, default: 60, description: "Px of swipe needed to change slide." },
    { name: "starColor", type: "color", default: "#facc15", description: "Star color." },
  ],
  usage: `<TestimonialCarousel
  testimonials={[
    { quote: "Best library we have used.", name: "Maya Okafor", role: "Design Engineer", avatar: "/maya.jpg", rating: 5 },
  ]}
/>`,
} satisfies Meta;
