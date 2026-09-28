"use client";

import { demoImages } from "../../demo-kit";
import { TestimonialCarousel, type Testimonial } from "./testimonial-carousel";

const faces = demoImages(12, 160, 160);

const testimonials: Testimonial[] = [
  {
    quote: "We replaced three internal dashboards in a weekend. The components feel considered down to the last easing curve.",
    name: "Maya Okafor",
    role: "Design Engineer, Northwind",
    avatar: faces[3],
    rating: 5,
  },
  {
    quote: "Our marketing site went from fine to the thing prospects mention on sales calls. Conversion is up 18% since launch.",
    name: "Daniel Reyes",
    role: "Head of Growth, Lumen",
    avatar: faces[7],
    rating: 5,
  },
  {
    quote: "Accessible by default, no fighting the markup. Our audit came back with zero blockers for the first time.",
    name: "Priya Natarajan",
    role: "Frontend Lead, Arcflow",
    avatar: faces[5],
    rating: 4,
  },
  {
    quote: "I copy, paste and tweak one prop. It is the rare library that makes me faster instead of slower.",
    name: "Tom Lindqvist",
    role: "Indie Developer",
    avatar: faces[10],
    rating: 5,
  },
];

export default function Demo(p: Record<string, unknown>) {
  return <TestimonialCarousel testimonials={testimonials} {...p} />;
}
