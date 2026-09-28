"use client";

import { ModernLoader } from "./modern-loader";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-10">
      <ModernLoader {...p} />
      <div className="flex items-center gap-8">
        <ModernLoader size={40} thickness={4} colors={["#a3e635", "#22d3ee"]} />
        <ModernLoader size={56} thickness={5} colors={["#fbbf24", "#f97316", "#ef4444"]} speed={0.7} />
        <ModernLoader size={40} thickness={4} colors={["#e879f9", "#818cf8"]} speed={1.4} />
      </div>
    </div>
  );
}
