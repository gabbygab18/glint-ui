"use client";

import { MorningWidget } from "./morning-widget";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full justify-center px-4">
      <MorningWidget name="Gab" {...p} className="max-w-[400px]" />
    </div>
  );
}
