"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";

export interface ThoughtLineProps {
  /** Reasoning steps so far. The last one is the current step while running. */
  steps?: string[];
  /** True while the model is still thinking. */
  running?: boolean;
  label?: string;
  /** Shown when finished. `{s}` becomes the elapsed seconds. */
  doneLabel?: string;
  /** CSS color of the travelling highlight. */
  highlight?: string;
  defaultOpen?: boolean;
  className?: string;
}

const css = `
@keyframes thought-line-wave{0%,55%,100%{transform:translateY(0);color:var(--tl-base)}20%{transform:translateY(-3px);color:var(--tl-hi)}}
@keyframes thought-line-sheen{from{background-position:100% 0}to{background-position:0 0}}
@keyframes thought-line-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
.thought-line-char{display:inline-block;white-space:pre;animation:thought-line-wave 1.6s ease-in-out infinite}
.thought-line-sheen{background:linear-gradient(90deg,var(--tl-base) 40%,var(--tl-hi) 50%,var(--tl-base) 60%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:thought-line-sheen 2.2s linear infinite}
.thought-line-ping{animation:thought-line-ping 1.4s ease-out infinite}
@media (prefers-reduced-motion:reduce){.thought-line-char,.thought-line-sheen,.thought-line-ping{animation:none}.thought-line-sheen{color:var(--tl-base)}}
`;

export function ThoughtLine({
  steps = [],
  running = true,
  label = "Thinking",
  doneLabel = "Thought for {s}s",
  highlight = "var(--foreground)",
  defaultOpen = false,
  className,
}: ThoughtLineProps) {
  const reduce = useReducedMotion();
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [seconds, setSeconds] = useState(0);
  const started = useRef(0);
  const current = steps[steps.length - 1];

  useEffect(() => {
    if (running) {
      started.current = Date.now();
      return;
    }
    if (started.current) setSeconds(Math.max(1, Math.round((Date.now() - started.current) / 1000)));
  }, [running]);

  const chars = [...label, ".", ".", "."];

  return (
    <div
      className={`w-full max-w-md text-sm ${className ?? ""}`}
      style={{ "--tl-base": "var(--muted-foreground)", "--tl-hi": highlight } as CSSProperties}
    >
      <style href="thought-line" precedence="default">
        {css}
      </style>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="group flex max-w-full items-center gap-2 rounded-md py-1 pr-1 text-left text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <motion.span
          className="grid shrink-0 place-items-center"
          animate={running && !reduce ? { rotate: [0, 18, -12, 0], scale: [1, 1.15, 0.95, 1] } : { rotate: 0, scale: 1 }}
          transition={running ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        >
          <Sparkles aria-hidden className="size-4" style={{ color: running ? highlight : undefined }} />
        </motion.span>
        {running ? (
          <>
            <span className="sr-only">
              {label}
              {current ? `: ${current}` : ""}
            </span>
            <span aria-hidden className="shrink-0 font-medium">
              {chars.map((c, i) => (
                <span key={i} className="thought-line-char" style={{ animationDelay: `${i * 70}ms` }}>
                  {c}
                </span>
              ))}
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
              {current && !open && (
                <motion.span
                  key={current}
                  aria-hidden
                  className="thought-line-sheen truncate"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: reduce ? 0 : 0.35 }}
                >
                  {current}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        ) : (
          <span className="font-medium">{doneLabel.replace("{s}", String(seconds || Math.max(1, steps.length)))}</span>
        )}
        <motion.span
          aria-hidden
          className="shrink-0"
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 18 }}
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            <ol aria-live="polite" className="relative mt-2 ml-2 grid gap-2.5 border-l border-border py-1 pl-5">
              <AnimatePresence initial={false}>
                {steps.map((s, i) => {
                  const live = running && i === steps.length - 1;
                  return (
                    <motion.li
                      key={`${i}-${s}`}
                      className="relative leading-5"
                      initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
                    >
                      <span
                        aria-hidden
                        className="absolute top-1.5 -left-[25px] grid size-2 place-items-center rounded-full"
                        style={{ background: live ? highlight : "var(--muted-foreground)", opacity: live ? 1 : 0.5 }}
                      >
                        {live && <span className="thought-line-ping absolute inset-0 rounded-full" style={{ background: highlight }} />}
                      </span>
                      <span className={live ? "thought-line-sheen" : "text-muted-foreground"}>{s}</span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
