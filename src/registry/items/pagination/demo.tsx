"use client";

import { useState } from "react";
import { Pagination } from "./pagination";

export default function Demo(p: Record<string, unknown>) {
  const [page, setPage] = useState(6);
  const total = (p.total as number) ?? 20;
  return (
    <div className="grid w-full max-w-xl justify-items-center gap-6 rounded-2xl border border-border bg-card px-4 py-8 shadow-xl">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{(Math.min(page, total) - 1) * 12 + 1}</span> to{" "}
        <span className="font-medium text-foreground">{Math.min(page, total) * 12}</span> of{" "}
        <span className="font-medium text-foreground">{total * 12}</span> results
      </p>
      <Pagination total={total} {...p} page={page} onPageChange={setPage} />
    </div>
  );
}
