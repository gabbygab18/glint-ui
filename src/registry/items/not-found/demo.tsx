"use client";

import { NotFound } from "./not-found";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <NotFound {...p} />
    </div>
  );
}
