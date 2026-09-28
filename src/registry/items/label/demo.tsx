"use client";

import { Label } from "./label";

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30";

export default function Demo(p: Record<string, unknown>) {
  return (
    <form className="grid w-full max-w-sm gap-5 rounded-2xl border border-border bg-card p-6 shadow-xl" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-2">
        <Label htmlFor="lbl-email" {...p} />
        <input id="lbl-email" type="email" required={Boolean(p.required)} aria-describedby="lbl-email-hint" placeholder="you@acme.dev" className={field} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lbl-password" required hint="At least 12 characters.">
          Password
        </Label>
        <input id="lbl-password" type="password" required aria-describedby="lbl-password-hint" defaultValue="hunter2hunter2" className={field} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lbl-company" optional>
          Company
        </Label>
        <input id="lbl-company" placeholder="Acme Inc." className={field} />
      </div>
    </form>
  );
}
