"use client";

import { Gravity } from "./gravity";

const pills = [
  ["React", "bg-[#c6ff3d] text-black"],
  ["Physics", "bg-cyan-300 text-black"],
  ["Drag me", "bg-foreground text-background"],
  ["TypeScript", "bg-blue-500 text-white"],
  ["Motion", "bg-fuchsia-400 text-black"],
  ["Throw me", "bg-orange-400 text-black"],
  ["Canvas", "border border-border bg-card text-foreground"],
  ["Tailwind", "bg-sky-400 text-black"],
  ["Springs", "border border-border bg-card text-foreground"],
  ["WebGL", "bg-rose-400 text-black"],
  ["Next.js", "bg-foreground text-background"],
  ["Design", "bg-amber-300 text-black"],
  ["matter-js", "border border-border bg-card text-foreground"],
  ["60fps", "bg-emerald-400 text-black"],
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-1/4 text-center">
        <p className="text-5xl font-semibold tracking-tight text-foreground/15 sm:text-7xl">Things fall into place.</p>
      </div>
      <Gravity key={JSON.stringify(p)} {...p} className="absolute inset-0">
        {pills.map(([label, cls]) => (
          <span key={label} className={`block whitespace-nowrap rounded-full px-6 py-3 text-lg font-semibold ${cls}`}>
            {label}
          </span>
        ))}
      </Gravity>
    </>
  );
}
