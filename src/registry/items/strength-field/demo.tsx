"use client";

import { StrengthField } from "./strength-field";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <p className="mb-4 text-sm font-semibold text-foreground">Create your account</p>
      <StrengthField defaultValue="glint" {...p} />
    </div>
  );
}
