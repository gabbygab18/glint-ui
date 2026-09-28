"use client";

import { Keyboard } from "./keyboard";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="px-4 py-8">
      <Keyboard {...p} />
    </div>
  );
}
