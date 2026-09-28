"use client";

import { demoImages } from "../../demo-kit";
import { KineticTestimonials } from "./kinetic-testimonials";

const avatars = demoImages(10, 96, 96);

const testimonials = [
  { name: "Maya Okafor", title: "Design lead, Northwind", rating: 5, quote: "We replaced three internal libraries with this. Our landing page finally feels alive, and the bundle got smaller." },
  { name: "Daniel Brandt", title: "Staff engineer, Loop", rating: 5, quote: "Copy, paste, ship. Every component respects reduced motion out of the box, which our a11y audit loved." },
  { name: "Priya Raman", title: "Founder, Tidepool", rating: 5, quote: "The animations are tasteful instead of noisy. Conversion on our pricing page went up 18% after the refresh." },
  { name: "Luca Moretti", title: "Frontend, Halcyon", rating: 4, quote: "Clean TypeScript, sane props, no magic. I read the source once and could extend it in minutes." },
  { name: "Hana Sato", title: "Product designer", rating: 5, quote: "It is rare that the thing I prototype in Figma matches what ships. This got us there." },
  { name: "Owen Mitchell", title: "CTO, Parcel Labs", rating: 5, quote: "Smooth at 60fps even on our cheapest test Android. Whoever tuned these springs knows what they are doing." },
  { name: "Sofia Lindqvist", title: "Indie hacker", rating: 5, quote: "I launched my side project with a hero section that looks like a funded startup made it." },
  { name: "Marcus Hale", title: "Engineering manager, Vela", rating: 4, quote: "Dark and light themes just work because everything uses tokens. Zero overrides needed." },
  { name: "Aisha Bello", title: "Creative developer", rating: 5, quote: "Finally a library where motion feels considered. The easing curves alone are worth it." },
].map((t, i) => ({ ...t, avatar: avatars[i] }));

export default function Demo(p: Record<string, unknown>) {
  return <KineticTestimonials testimonials={testimonials} {...p} />;
}
