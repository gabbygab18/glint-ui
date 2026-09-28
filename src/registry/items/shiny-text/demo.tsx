"use client";

import { ShinyText } from "./shiny-text";

export default function Demo(p: Record<string, unknown>) {
  return <ShinyText text="" {...p} className="text-4xl font-semibold tracking-tight sm:text-5xl" />;
}
