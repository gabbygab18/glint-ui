"use client";

import { EchoText } from "./echo-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <EchoText {...p} className="text-8xl font-black tracking-tight sm:text-[10rem]" />
    </div>
  );
}
