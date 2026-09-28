"use client";

import { AsciiText } from "./ascii-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <AsciiText {...p} />
    </div>
  );
}
