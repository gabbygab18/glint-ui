"use client";

import { FolderFloat } from "./folder-float";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-4">
      <FolderFloat key={String(p.defaultOpen)} {...p} />
      <FolderFloat label="Receipts" color="#fbbf24" files={["march.pdf", "april.pdf"]} />
    </div>
  );
}
