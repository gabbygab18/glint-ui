"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { InputOTP } from "./input-otp";

export default function Demo(p: Record<string, unknown>) {
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");

  return (
    <div className="grid w-full max-w-md justify-items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
      <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
        <MailCheck className="size-5" />
      </span>
      <div className="grid gap-1">
        <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
        <p className="text-sm text-muted-foreground">Enter the code we sent to ana@acme.dev</p>
      </div>
      <InputOTP
        key={String(p.length)}
        defaultValue="42"
        {...p}
        invalid={Boolean(p.invalid) || status === "bad"}
        onChange={() => setStatus("idle")}
        onComplete={(v) => setStatus(/^4242/.test(v) ? "ok" : "bad")}
      />
      <p aria-live="polite" className="h-5 text-sm text-muted-foreground">
        {status === "ok" ? (
          <span className="text-primary">Verified. Welcome back!</span>
        ) : status === "bad" ? (
          <span className="text-destructive">That code did not match. Try 4242...</span>
        ) : (
          "Paste works too."
        )}
      </p>
    </div>
  );
}
