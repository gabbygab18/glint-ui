"use client";

import { FileLift } from "./file-lift";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-4">
      <FileLift key={String(p.defaultOpen)} {...p} />
      <FileLift label="Receipts" color="#fbbf24" files={["march.pdf", "april.pdf"]} />
    </div>
  );
}
