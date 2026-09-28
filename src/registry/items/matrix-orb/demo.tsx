"use client";

import { useEffect, useState } from "react";
import { MatrixOrb, type MatrixOrbState } from "./matrix-orb";

const CYCLE: MatrixOrbState[] = ["idle", "listening", "thinking"];

export default function Demo(p: Record<string, unknown>) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % CYCLE.length), 3500);
    return () => clearInterval(id);
  }, []);
  return <MatrixOrb size={200} {...p} state={CYCLE[i]} />;
}
