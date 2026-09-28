"use client";
/* eslint-disable @next/next/no-img-element */

import { MapPin, Star } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { CardFlip } from "./card-flip";

const [a, b] = demoImages(2, 560, 760);

const places = [
  { src: a, place: "Kyoto", country: "Japan", nights: 5, price: "$1,240", rating: 4.9, tags: ["Temples", "Tea houses", "Gardens"] },
  { src: b, place: "Lofoten", country: "Norway", nights: 7, price: "$1,860", rating: 4.8, tags: ["Fjords", "Hiking", "Northern lights"] },
];

const Front = ({ src, place, country }: (typeof places)[number]) => (
  <div className="relative size-full bg-muted">
    <img src={src} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
      <p className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/70">
        <MapPin className="size-3" /> {country}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{place}</p>
    </div>
  </div>
);

const Back = ({ place, nights, price, rating, tags }: (typeof places)[number]) => (
  <div className="flex size-full flex-col border border-border bg-card p-6 text-foreground">
    <p className="text-xs uppercase tracking-widest text-muted-foreground">{nights} nights</p>
    <p className="mt-1 text-2xl font-semibold tracking-tight">{place} escape</p>
    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
      <Star className="size-4 fill-amber-300 text-amber-300" /> {rating} · 312 reviews
    </p>
    <div className="mt-5 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {t}
        </span>
      ))}
    </div>
    <div className="mt-auto flex items-end justify-between">
      <div>
        <p className="text-xs text-muted-foreground">from</p>
        <p className="text-2xl font-semibold">{price}</p>
      </div>
      <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Book trip</span>
    </div>
  </div>
);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      {places.map((pl) => (
        <CardFlip key={pl.place} front={<Front {...pl} />} back={<Back {...pl} />} {...p} />
      ))}
    </div>
  );
}
