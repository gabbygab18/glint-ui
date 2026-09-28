"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

export type SocialProvider = "github" | "google";

export interface LoginFormProps {
  title?: string;
  description?: string;
  /** Show the GitHub / Google buttons. */
  showSocial?: boolean;
  /** Show the "Remember me" checkbox. */
  showRemember?: boolean;
  /** Minimum password length accepted by client-side validation. */
  minPasswordLength?: number;
  submitLabel?: string;
  /** Called with valid values. Throw (or reject) with an Error to show its message as a form error. */
  onSubmit?: (values: LoginValues) => void | Promise<void>;
  /** Called when a social button is pressed. The button spins until the promise settles. */
  onSocial?: (provider: SocialProvider) => void | Promise<void>;
  /** Content under the card, e.g. a sign-up link. */
  footer?: ReactNode;
  className?: string;
}

type Errors = Partial<Record<"email" | "password", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function validate(email: string, password: string, min: number): Errors {
  const e: Errors = {};
  if (!email.trim()) e.email = "Email is required.";
  else if (!EMAIL.test(email.trim())) e.email = "Enter a valid email address.";
  if (!password) e.password = "Password is required.";
  else if (password.length < min) e.password = `Use at least ${min} characters.`;
  return e;
}

const GitHubMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden className="size-4">
    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.8Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4.01-3.1Z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.27 6.61l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
  </svg>
);

const inputCls = cn(
  "peer h-11 w-full rounded-xl border border-input bg-background/60 pl-10 text-sm text-foreground shadow-xs outline-none",
  "placeholder:text-muted-foreground/70 transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-foreground/20 focus:border-ring focus:bg-background focus:ring-[3px] focus:ring-ring/25",
  "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/25 disabled:opacity-60",
);

function FieldError({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          key="err"
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden text-xs text-destructive"
        >
          <span className="flex items-center gap-1.5 pt-1.5">
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            {children}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function LoginForm({
  title = "Welcome back",
  description = "Sign in to continue to your workspace.",
  showSocial = true,
  showRemember = true,
  minPasswordLength = 8,
  submitLabel = "Sign in",
  onSubmit = () => wait(1400),
  onSocial = () => wait(1200),
  footer,
  className,
}: LoginFormProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const shake = useAnimationControls();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formError, setFormError] = useState("");
  const [social, setSocial] = useState<SocialProvider | null>(null);

  const errors = validate(email, password, minPasswordLength);
  const show = (k: keyof Errors) => (touched[k] ? errors[k] : undefined);
  const busy = status === "loading" || social !== null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError("");
    if (errors.email || errors.password) {
      if (!reduce) shake.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.4 } });
      e.currentTarget.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setStatus("loading");
    try {
      await onSubmit({ email: email.trim(), password, remember });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      if (!reduce) shake.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.4 } });
    }
  };

  const pressSocial = async (p: SocialProvider) => {
    setSocial(p);
    try {
      await onSocial(p);
    } finally {
      setSocial(null);
    }
  };

  const reset = () => {
    setStatus("idle");
    setPassword("");
    setTouched({});
  };

  return (
    <motion.div
      animate={shake}
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-7 text-card-foreground shadow-2xl shadow-black/20",
        className,
      )}
    >
      {/* soft brand glow along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_28%,transparent),transparent)]"
      />
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative grid place-items-center py-8 text-center"
            role="status"
          >
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.05 }}
              className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            >
              <Check className="size-7" strokeWidth={3} aria-hidden />
            </motion.span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">You&apos;re signed in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{email.trim()}</span>
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Sign out
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            aria-labelledby={`${id}-t`}
            aria-busy={busy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative"
          >
            <div className="mb-6">
              <div
                aria-hidden
                className="mb-5 grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-md shadow-primary/25"
              >
                <Lock className="size-4.5" />
              </div>
              <h2 id={`${id}-t`} className="text-2xl font-semibold tracking-tight">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>

            <fieldset disabled={busy} className="grid gap-4">
              {showSocial && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["github", "google"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => pressSocial(p)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/60 text-sm font-medium outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97] disabled:opacity-60"
                      >
                        {social === p ? (
                          <LoaderCircle className="size-4 animate-spin" aria-hidden />
                        ) : p === "github" ? (
                          <GitHubMark />
                        ) : (
                          <GoogleMark />
                        )}
                        {p === "github" ? "GitHub" : "Google"}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    <span className="h-px flex-1 bg-border" />
                    or with email
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </>
              )}

              <AnimatePresence initial={false}>
                {formError && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {formError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor={`${id}-e`} className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <input
                    id={`${id}-e`}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={!!show("email")}
                    aria-describedby={show("email") ? `${id}-ee` : undefined}
                    className={cn(inputCls, "pr-3")}
                  />
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-foreground" aria-hidden />
                </div>
                <FieldError id={`${id}-ee`}>{show("email")}</FieldError>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor={`${id}-p`} className="text-sm font-medium">
                    Password
                  </label>
                  <a href="#" onClick={(e) => e.preventDefault()} className="rounded text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id={`${id}-p`}
                    type={reveal ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    aria-invalid={!!show("password")}
                    aria-describedby={show("password") ? `${id}-pe` : undefined}
                    className={cn(inputCls, "pr-11")}
                  />
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-foreground" aria-hidden />
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    aria-label={reveal ? "Hide password" : "Show password"}
                    aria-pressed={reveal}
                    className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={reveal ? "off" : "on"}
                        initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                      >
                        {reveal ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
                <FieldError id={`${id}-pe`}>{show("password")}</FieldError>
              </div>

              {showRemember && (
                <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 cursor-pointer rounded accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                  Remember me for 30 days
                </label>
              )}

              <button
                type="submit"
                className="group relative mt-1 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 outline-none transition-[background-color,scale,box-shadow] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:opacity-80"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {status === "loading" ? (
                    <motion.span key="l" className="inline-flex items-center gap-2" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                      Signing in…
                    </motion.span>
                  ) : (
                    <motion.span key="i" className="inline-flex items-center gap-2" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                      {submitLabel}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </fieldset>
            {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
