"use client";

import { ArrowRight, Check, Copy } from "@/components/site-icons";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { REGISTRY_NAMESPACE } from "@/lib/site";
import { useToast } from "@/registry/items/toast/toast";

export interface BuilderItem {
  slug: string;
  name: string;
  dependencies: string[];
}

const MANAGERS = [
  { id: "npm", run: "npx shadcn@latest add" },
  { id: "pnpm", run: "pnpm dlx shadcn@latest add" },
  { id: "yarn", run: "yarn dlx shadcn@latest add" },
  { id: "bun", run: "bunx --bun shadcn@latest add" },
] as const;

const SPRING = { type: "spring", bounce: 0.2, duration: 0.4 } as const;
const BLUR_IN = { opacity: 0, filter: "blur(4px)" };
const SHOWN = { opacity: 1, filter: "blur(0px)" };

function Radio({ on }: { on: boolean }) {
  return (
    <span className={`grid size-4 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${on ? "border-foreground" : "border-border"}`}>
      <motion.span className="size-1.5 rounded-full bg-foreground" initial={false} animate={{ scale: on ? 1 : 0 }} transition={SPRING} />
    </span>
  );
}

/** A value that rolls to its new content instead of snapping. */
function Roll({ value, children }: { value: string; children: ReactNode }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "70%", ...BLUR_IN }}
          animate={{ y: "0%", ...SHOWN }}
          exit={{ y: "-70%", ...BLUR_IN }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Pick components and a package manager; the dark panel builds the exact install command. */
export function InstallBuilder({ items }: { items: BuilderItem[] }) {
  const [picked, setPicked] = useState<string[]>(items.slice(0, 2).map((i) => i.slug));
  const [pm, setPm] = useState<(typeof MANAGERS)[number]["id"]>("npm");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Keep the command in the order things were picked, so new parts appear at the end.
  const chosen = picked.flatMap((slug) => items.filter((i) => i.slug === slug));
  const deps = [...new Set(chosen.flatMap((i) => i.dependencies))].sort();
  const run = MANAGERS.find((m) => m.id === pm)!.run;
  const command = chosen.length ? `${run} ${chosen.map((i) => `${REGISTRY_NAMESPACE}/${i.slug}`).join(" ")}` : "";

  const toggle = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      toast({ title: "Could not copy", description: "Your browser blocked clipboard access.", variant: "error" });
      return;
    }
    setCopied(true);
    toast({ id: "copied", title: "Command copied", variant: "success", duration: 1800 });
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-xl lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-9">
          <p className="text-sm font-medium text-muted-foreground">Which components do you need?</p>
          <LayoutGroup>
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((i) => {
                const on = picked.includes(i.slug);
                return (
                  <motion.button
                    key={i.slug}
                    layout
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(i.slug)}
                    transition={SPRING}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm transition-colors duration-300 ${
                      on ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span
                          key="check"
                          className="inline-flex overflow-hidden"
                          initial={{ width: 0, opacity: 0, scale: 0.4 }}
                          animate={{ width: "auto", opacity: 1, scale: 1 }}
                          exit={{ width: 0, opacity: 0, scale: 0.4 }}
                          transition={SPRING}
                        >
                          <Check className="mr-1.5 size-3.5 shrink-0" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.span layout="position" transition={SPRING}>
                      {i.name}
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>

          <p className="mt-9 text-sm font-medium text-muted-foreground">Which package manager?</p>
          <div role="radiogroup" aria-label="Package manager" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MANAGERS.map((m) => {
              const on = pm === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPm(m.id)}
                  className="relative flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/40"
                >
                  {/* One highlight that slides to the chosen option. */}
                  {on && (
                    <motion.span
                      layoutId="pm-highlight"
                      className="absolute -inset-px rounded-2xl border border-foreground bg-muted/60"
                      transition={SPRING}
                    />
                  )}
                  <span className="relative">{m.id}</span>
                  <span className="relative">
                    <Radio on={on} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="dark flex flex-col p-6 text-white sm:p-9"
          style={{ background: "radial-gradient(500px circle at 100% 0%, oklch(0.42 0.12 128 / 0.5), transparent 60%), linear-gradient(160deg, oklch(0.23 0.035 128), oklch(0.15 0.02 125))" }}
        >
          <p className="text-sm text-white/70">Your install command</p>
          {/* Each part of the command enters and leaves on its own; the rest glide over. */}
          <p className="mt-3 flex min-h-[4.5rem] flex-wrap content-start gap-x-[1ch] font-mono text-[15px] leading-relaxed text-[#d9ff6b]" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              {chosen.length ? (
                [
                  <motion.span key={`run-${pm}`} layout initial={BLUR_IN} animate={SHOWN} exit={BLUR_IN} transition={SPRING}>
                    {run}
                  </motion.span>,
                  ...chosen.map((i) => (
                    <motion.span
                      key={i.slug}
                      layout
                      initial={{ ...BLUR_IN, y: 6 }}
                      animate={{ ...SHOWN, y: 0 }}
                      exit={{ ...BLUR_IN, y: -6 }}
                      transition={SPRING}
                    >
                      {REGISTRY_NAMESPACE}/{i.slug}
                    </motion.span>
                  )),
                ]
              ) : (
                <motion.span key="empty" className="text-white/40" initial={BLUR_IN} animate={SHOWN} exit={BLUR_IN}>
                  Pick at least one component
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          <dl className="mt-6 divide-y divide-white/10 text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-white/70">Components</dt>
              <dd className="font-semibold">
                <Roll value={String(chosen.length)}>{chosen.length}</Roll>
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-white/70">npm packages</dt>
              <dd className="text-right font-semibold">
                <Roll value={deps.join(",")}>{deps.length ? deps.join(", ") : "None"}</Roll>
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-white/70">Files added</dt>
              <dd className="font-semibold">
                <Roll value={String(chosen.length)}>{chosen.length ? `${chosen.length} in components/ui` : "None"}</Roll>
              </dd>
            </div>
          </dl>

          <button
            type="button"
            disabled={!command}
            onClick={copy}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#d9ff6b] py-2 pl-5 pr-2 text-sm font-semibold text-[#141a0f] transition-[opacity,transform] hover:opacity-90 active:scale-[0.97] disabled:opacity-40"
          >
            <Roll value={copied ? "copied" : "copy"}>{copied ? "Copied" : "Copy command"}</Roll>
            <span className="grid size-7 place-items-center rounded-full bg-[#141a0f] text-[#d9ff6b]">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </span>
          </button>
          <p className="mt-4 text-xs leading-relaxed text-white/50">
            The shadcn CLI copies each file into your project, where you can read and change it.{" "}
            <Link href="/docs/installation" className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-white">
              Setup guide <ArrowRight className="size-3" />
            </Link>
          </p>
        </div>
      </div>
    </MotionConfig>
  );
}
