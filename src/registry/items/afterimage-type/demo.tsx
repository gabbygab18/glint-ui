"use client";

import { AfterimageType } from "./afterimage-type";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <AfterimageType {...p} className="text-8xl font-black tracking-tight sm:text-[10rem]" />
    </div>
  );
}
