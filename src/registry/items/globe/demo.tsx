"use client";

import { Globe } from "./globe";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full flex-col items-center px-4 py-4">
      <Globe className="max-w-[460px]" {...p} />
      <p className="-mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">10 regions</span> · drag to spin
      </p>
    </div>
  );
}
