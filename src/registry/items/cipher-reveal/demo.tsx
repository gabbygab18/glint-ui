"use client";

import { CipherReveal } from "./cipher-reveal";

export default function Demo(p: Record<string, unknown>) {
  return <CipherReveal text="" {...p} className="font-mono text-3xl text-lime-300 sm:text-4xl" />;
}
