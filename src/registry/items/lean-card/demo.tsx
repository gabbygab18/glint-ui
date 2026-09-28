"use client";

import { MapPin, Star } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { LeanCard } from "./lean-card";

const photos = demoImages(3, 480, 360);
const trips = [
  { place: "Lofoten, Norway", title: "Cabins under the aurora", nights: 4, price: 820, rating: 4.9 },
  { place: "Kyoto, Japan", title: "Temples and tea houses", nights: 6, price: 1240, rating: 4.8 },
  { place: "Patagonia, Chile", title: "Torres del Paine trek", nights: 8, price: 1590, rating: 5.0 },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex items-center gap-2">
      {trips.map((t, i) => (
        <div key={t.place} className={i === 1 ? "" : "hidden md:block"}>
          <LeanCard {...p} className="w-60">
            <div className="p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[i]} alt="" draggable={false} className="h-36 w-full rounded-2xl object-cover" />
            </div>
            <div className="px-4 pb-4">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden /> {t.place}
              </p>
              <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-foreground">{t.title}</h3>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="text-base font-semibold text-foreground">${t.price}</span> / {t.nights} nights
                </p>
                <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden /> {t.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </LeanCard>
        </div>
      ))}
    </div>
  );
}
