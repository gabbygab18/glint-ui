"use client";

import { LatticeLoader } from "./lattice-loader";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid justify-items-center gap-6">
      <LatticeLoader {...p} />
      <div className="flex items-center gap-6">
        <LatticeLoader size={28} grid={2} color="#38bdf8" />
        <LatticeLoader size={40} variant="dots" color="#f472b6" />
        <LatticeLoader size={40} grid={4} color="#fbbf24" duration={1.8} />
      </div>
    </div>
  );
}
