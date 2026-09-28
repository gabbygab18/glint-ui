"use client";

import { Clock } from "./clock";

const cities = [
  ["America/New_York", "New York"],
  ["Europe/London", "London"],
  ["Asia/Tokyo", "Tokyo"],
];

export default function Demo(p: Record<string, unknown>) {
  const tz = (p.timeZone as string) || undefined;
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <Clock {...p} timeZone={tz} />
      <div className="flex gap-6">
        {cities.map(([tz, name]) => (
          <figure key={tz} className="flex flex-col items-center gap-2">
            <Clock timeZone={tz} label="" size={88} showDigital={false} showNumbers={false} accent={p.accent as string} />
            <figcaption className="text-xs font-medium text-muted-foreground">{name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
