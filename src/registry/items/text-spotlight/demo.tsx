"use client";

import { TextSpotlight } from "./text-spotlight";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TextSpotlight
      text=""
      {...p}
      className="max-w-3xl px-6 text-center text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.05]"
    />
  );
}
