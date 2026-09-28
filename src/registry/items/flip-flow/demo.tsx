"use client";

import { demoImages } from "../../demo-kit";
import { FlipFlow } from "./flip-flow";

const photos = demoImages(12, 360, 480);
const places = [
  ["Kyoto", "JP", "08:40"],
  ["Lisbon", "PT", "09:15"],
  ["Reykjavík", "IS", "10:05"],
  ["Oaxaca", "MX", "10:50"],
  ["Tromsø", "NO", "11:20"],
  ["Hội An", "VN", "12:35"],
  ["Cusco", "PE", "13:10"],
  ["Tangier", "MA", "14:45"],
  ["Hobart", "AU", "15:30"],
  ["Bergen", "NO", "16:00"],
  ["Nara", "JP", "16:55"],
  ["Sintra", "PT", "17:40"],
];

const tile = (i: number) => {
  const [city, cc, time] = places[i];
  return (
    <div key={city} className="relative size-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[i]} alt={`${city}, ${cc}`} className="absolute inset-0 size-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
      <p className="absolute left-3 top-3 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-white/90 backdrop-blur">{time}</p>
      <div className="absolute inset-x-3 bottom-3 text-white">
        <p className="text-[11px] uppercase tracking-[.2em] text-white/60">{cc}</p>
        <p className="text-xl font-semibold tracking-tight">{city}</p>
      </div>
    </div>
  );
};

// Four tiles, each cycling its own three destinations, staggered so they flip in a wave.
const columns = [0, 1, 2, 3].map((c) => [0, 1, 2].map((k) => tile(c + k * 4)));

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Warm the cache so tiles never flip to a half-loaded photo. */}
      {photos.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <p className="font-mono text-xs uppercase tracking-[.3em] text-muted-foreground">Departures</p>
      <div className="flex flex-wrap justify-center gap-4">
        {columns.map((items, i) => (
          <FlipFlow key={i} {...p} items={items} delay={i * 160} width={160} height={220} className={i === 3 ? "hidden sm:block" : ""} />
        ))}
      </div>
    </div>
  );
}
