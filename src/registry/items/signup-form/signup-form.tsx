"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { Check, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, MailCheck, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignupValues {
  name: string;
  email: string;
  password: string;
}

export interface SignupFormProps {
  title?: string;
  description?: string;
  /** Minimum strength (0-4) the password must reach before the form submits. */
  minStrength?: number;
  /** Show the rule checklist under the strength meter. */
  showRules?: boolean;
  submitLabel?: string;
  /** Called with valid values. Throw an Error to show its message as a form error. */
  onSubmit?: (values: SignupValues) => void | Promise<void>;
  /** Terms label. Links inside are fine. */
  terms?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

type Key = "name" | "email" | "password" | "terms";
type Errors = Partial<Record<Key, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const passwordRules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Upper & lowercase", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/** 0 (under 8 chars) .. 4 (strong). Each extra rule met, and a length of 12+, adds a point. */
export function passwordStrength(p: string) {
  if (p.length < 8) return 0;
  const passed = passwordRules.filter((r) => r.test(p)).length + (p.length >= 12 ? 1 : 0);
  return Math.min(4, Math.max(1, passed - 1));
}

const LEVELS = [
  { label: "Too short", color: "#ef4444" },
  { label: "Weak", color: "#f97316" },
  { label: "Fair", color: "#eab308" },
  { label: "Good", color: "#84cc16" },
  { label: "Strong", color: "#10b981" },
];

const inputCls = cn(
  "peer h-11 w-full rounded-xl border border-input bg-background/60 pl-10 text-sm text-foreground shadow-xs outline-none",
  "placeholder:text-muted-foreground/70 transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-foreground/20 focus:border-ring focus:bg-background focus:ring-[3px] focus:ring-ring/25",
  "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/25 disabled:opacity-60",
);
const iconCls =
  "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-foreground";

function FieldError({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
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

export function SignupForm({
  title = "Create your account",
  description = "Start your 14-day trial. No credit card needed.",
  minStrength = 2,
  showRules = true,
  submitLabel = "Create account",
  onSubmit = () => new Promise((r) => setTimeout(r, 1500)),
  terms = "I agree to the Terms of Service and Privacy Policy",
  footer,
  className,
}: SignupFormProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const shake = useAnimationControls();
  const [v, setV] = useState({ name: "", email: "", password: "", terms: false });
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formError, setFormError] = useState("");

  const strength = passwordStrength(v.password);
  const level = LEVELS[strength];

  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = v.name.trim() ? "Name looks too short." : "Tell us your name.";
  if (!v.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (!v.password) errors.password = "Choose a password.";
  else if (v.password.length < 8) errors.password = "Use at least 8 characters.";
  else if (strength < minStrength) errors.password = `Too weak. Aim for at least "${LEVELS[minStrength].label}".`;
  if (!v.terms) errors.terms = "Please accept the terms to continue.";
  const show = (k: Key) => (touched[k] ? errors[k] : undefined);
  const blur = (k: Key) => () => setTouched((t) => ({ ...t, [k]: true }));
  const set = (k: Key) => (e: { target: HTMLInputElement }) =>
    setV((s) => ({ ...s, [k]: k === "terms" ? e.target.checked : e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, terms: true });
    setFormError("");
    if (Object.keys(errors).length) {
      if (!reduce) shake.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.4 } });
      e.currentTarget.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setStatus("loading");
    try {
      await onSubmit({ name: v.name.trim(), email: v.email.trim(), password: v.password });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  return (
    <motion.div
      animate={shake}
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-7 text-card-foreground shadow-2xl shadow-black/20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-primary/20 blur-3xl"
      />
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="done"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative grid place-items-center py-8 text-center"
          >
            <div className="relative grid size-16 place-items-center">
              {!reduce &&
                [0, 1].map((i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 1.4, delay: 0.2 + i * 0.35, ease: "easeOut" }}
                  />
                ))}
              <motion.span
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 16 }}
                className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              >
                <MailCheck className="size-7" aria-hidden />
              </motion.span>
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight">Check your inbox</h2>
            <p className="mt-1.5 max-w-64 text-sm text-muted-foreground">
              Welcome aboard, {v.name.trim().split(" ")[0]}! We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{v.email.trim()}</span>.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setV({ name: "", email: "", password: "", terms: false });
                setTouched({});
              }}
              className="mt-6 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            aria-labelledby={`${id}-t`}
            aria-busy={status === "loading"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative"
          >
            <h2 id={`${id}-t`} className="text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}

            <fieldset disabled={status === "loading"} className="mt-6 grid gap-4">
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
                <label htmlFor={`${id}-n`} className="mb-1.5 block text-sm font-medium">
                  Full name
                </label>
                <div className="relative">
                  <input
                    id={`${id}-n`}
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    value={v.name}
                    onChange={set("name")}
                    onBlur={blur("name")}
                    aria-invalid={!!show("name")}
                    aria-describedby={show("name") ? `${id}-ne` : undefined}
                    className={cn(inputCls, "pr-3")}
                  />
                  <User className={iconCls} aria-hidden />
                </div>
                <FieldError id={`${id}-ne`}>{show("name")}</FieldError>
              </div>

              <div>
                <label htmlFor={`${id}-e`} className="mb-1.5 block text-sm font-medium">
                  Work email
                </label>
                <div className="relative">
                  <input
                    id={`${id}-e`}
                    type="email"
                    autoComplete="email"
                    placeholder="ada@analytical.co"
                    value={v.email}
                    onChange={set("email")}
                    onBlur={blur("email")}
                    aria-invalid={!!show("email")}
                    aria-describedby={show("email") ? `${id}-ee` : undefined}
                    className={cn(inputCls, "pr-3")}
                  />
                  <Mail className={iconCls} aria-hidden />
                </div>
                <FieldError id={`${id}-ee`}>{show("email")}</FieldError>
              </div>

              <div>
                <label htmlFor={`${id}-p`} className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id={`${id}-p`}
                    type={reveal ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={v.password}
                    onChange={set("password")}
                    onBlur={blur("password")}
                    aria-invalid={!!show("password")}
                    aria-describedby={`${id}-ps${show("password") ? ` ${id}-pe` : ""}`}
                    className={cn(inputCls, "pr-11")}
                  />
                  <Lock className={iconCls} aria-hidden />
                  <button
                    type="button"
                    onClick={() => setReveal((r) => !r)}
                    aria-label={reveal ? "Hide password" : "Show password"}
                    aria-pressed={reveal}
                    className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {reveal ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  </button>
                </div>

                {/* strength meter */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.span
                          className="absolute inset-0 origin-left rounded-full"
                          initial={false}
                          animate={{ scaleX: strength >= i ? 1 : 0, backgroundColor: level.color }}
                          transition={{ type: "spring", stiffness: 300, damping: 30, delay: strength >= i ? (i - 1) * 0.04 : 0 }}
                        />
                      </span>
                    ))}
                  </div>
                  <span id={`${id}-ps`} aria-live="polite" className="w-16 text-right text-xs font-medium tabular-nums" style={{ color: v.password ? level.color : undefined }}>
                    <span className="sr-only">Password strength: </span>
                    {v.password ? level.label : <span className="text-muted-foreground">Strength</span>}
                  </span>
                </div>
                {showRules && (
                  <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    {passwordRules.map((r) => {
                      const ok = r.test(v.password);
                      return (
                        <li key={r.label} className={cn("flex items-center gap-1.5 transition-colors duration-300", ok ? "text-foreground" : "text-muted-foreground")}>
                          <motion.span
                            initial={false}
                            animate={{ scale: ok ? [1, 1.35, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              "grid size-3.5 place-items-center rounded-full transition-colors duration-300",
                              ok ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {ok ? <Check className="size-2.5" strokeWidth={4} aria-hidden /> : <X className="size-2" strokeWidth={4} aria-hidden />}
                          </motion.span>
                          {r.label}
                          <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <FieldError id={`${id}-pe`}>{show("password")}</FieldError>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={v.terms}
                    onChange={set("terms")}
                    onBlur={blur("terms")}
                    aria-invalid={!!show("terms")}
                    aria-describedby={show("terms") ? `${id}-te` : undefined}
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                  <span>{terms}</span>
                </label>
                <FieldError id={`${id}-te`}>{show("terms")}</FieldError>
              </div>

              <button
                type="submit"
                className="relative mt-1 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 outline-none transition-[background-color,scale,box-shadow] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:opacity-80"
              >
                {status === "loading" ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Creating account…
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </fieldset>
            {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
