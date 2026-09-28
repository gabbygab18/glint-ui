"use client";

import { ChecklistCell } from "./checklist-cell";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full justify-center px-4 py-6">
      <ChecklistCell {...p} />
    </div>
  );
}
