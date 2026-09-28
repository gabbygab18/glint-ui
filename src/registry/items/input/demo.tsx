"use client";

import { useState } from "react";
import { AtSign, Eye, EyeOff, Lock, Search } from "lucide-react";
import { Input } from "./input";

export default function Demo(p: Record<string, unknown>) {
  const [email, setEmail] = useState("ana@acme");
  const [show, setShow] = useState(false);
  const bad = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);

  return (
    <div className="grid w-full max-w-sm gap-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
      <Input {...p} startIcon={<Search />} endIcon={<kbd className="rounded border border-border px-1 font-sans text-[10px]">/</kbd>} aria-label="Search" />
      <Input
        type="email"
        spellCheck={false}
        aria-label="Email"
        placeholder="you@acme.dev"
        startIcon={<AtSign />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={bad ? "Enter a full address, like ana@acme.dev" : undefined}
      />
      <Input
        type={show ? "text" : "password"}
        aria-label="Password"
        defaultValue="correct horse"
        startIcon={<Lock />}
        endIcon={
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="grid place-items-center rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        }
      />
    </div>
  );
}
