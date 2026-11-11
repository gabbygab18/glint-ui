"use client";

import { useState, type FormEvent } from "react";
import { NudgeField } from "./nudge-field";

export default function Demo(p: Record<string, unknown>) {
  const [email, setEmail] = useState("hello@glint");
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("That email is missing a domain, like .com");
      setAttempt((a) => a + 1);
      setSent(false);
      return;
    }
    setError(undefined);
    setSent(true);
  };

  return (
    <form onSubmit={submit} noValidate className="w-80 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <p className="text-sm font-semibold text-foreground">Join the beta</p>
      <p className="mb-4 mt-1 text-xs text-muted-foreground">Submit as is to see the nudge.</p>
      <NudgeField
        {...p}
        label="Email"
        type="email"
        value={email}
        error={error}
        attempt={attempt}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(undefined);
        }}
      />
      <button
        type="submit"
        className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        {sent ? "You're on the list" : "Request access"}
      </button>
    </form>
  );
}
