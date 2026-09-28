"use client";

import { demoImages } from "../../demo-kit";
import { AnimatedTestimonials } from "./animated-testimonials";

const photos = demoImages(5, 500, 500);

const testimonials = [
  {
    quote: "We rebuilt our onboarding in a weekend. The components just dropped in and felt native to our design system from day one.",
    name: "Maya Chen",
    role: "Head of Product, Lumen",
  },
  {
    quote: "The motion is subtle in all the right places. Our conversion on the pricing page went up eleven percent after the redesign.",
    name: "Leo Park",
    role: "Founder, Northwind Studio",
  },
  {
    quote: "Accessible out of the box, which almost never happens with animated UI. Our audit came back clean on the first pass.",
    name: "Ana Ruiz",
    role: "Design Engineer, Fieldnote",
  },
  {
    quote: "It is rare to find a library where copying a file is the whole install step. No lock-in, no surprises, just good code.",
    name: "Tomás Varga",
    role: "Staff Engineer, Parcel",
  },
  {
    quote: "Our team ships interfaces that feel expensive without spending weeks on polish. That is the whole pitch, and it delivers.",
    name: "Priya Nair",
    role: "CTO, Brightline",
  },
].map((t, i) => ({ ...t, src: photos[i] }));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-4xl px-4">
      <AnimatedTestimonials testimonials={testimonials} {...p} />
    </div>
  );
}
