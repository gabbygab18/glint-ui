"use client";

import { useState, type FormEvent } from "react";
import { AtSign, Check, Mail } from "lucide-react";
import { InteractiveInput } from "./interactive-input";

const TAKEN = ["admin", "root", "glint"];

export default function Demo(p: Record<string, unknown>) {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ user?: string; email?: string }>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!user) next.user = "Pick a username.";
    else if (!/^\w+$/.test(user)) next.user = "Only letters, numbers and underscores.";
    else if (TAKEN.includes(user.toLowerCase())) next.user = `@${user} is already taken.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Enter a valid email address.";
    setErrors(next);
    setSaved(!next.user && !next.email);
  };

  return (
    <form noValidate onSubmit={submit} className="grid w-full max-w-sm gap-4 rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/20">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-foreground">Claim your handle</h3>
        <p className="text-sm text-muted-foreground">Try &quot;admin&quot; to see the error shake.</p>
      </div>
      <InteractiveInput
        label="Username"
        icon={<AtSign />}
        autoComplete="username"
        value={user}
        onValueChange={(v) => {
          setUser(v);
          setSaved(false);
          setErrors((s) => ({ ...s, user: undefined }));
        }}
        {...p}
        error={(p.error as string) || errors.user}
      />
      <InteractiveInput
        label="Email"
        type="email"
        spellCheck={false}
        icon={<Mail />}
        placeholder="ada@analytical.co"
        autoComplete="email"
        showCounter={false}
        value={email}
        onValueChange={(v) => {
          setEmail(v);
          setSaved(false);
          setErrors((s) => ({ ...s, email: undefined }));
        }}
        error={errors.email}
      />
      <button
        type="submit"
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground outline-none transition-[background-color,scale] hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
      >
        {saved ? (
          <>
            <Check className="size-4" aria-hidden /> Saved
          </>
        ) : (
          "Save handle"
        )}
      </button>
    </form>
  );
}
