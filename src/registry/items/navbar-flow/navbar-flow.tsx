"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface NavbarFlowLink {
  label: string;
  href: string;
}

export interface NavbarFlowProps {
  links: NavbarFlowLink[];
  /** Logo / wordmark on the left. */
  brand?: ReactNode;
  /** Call to action on the right (a button or link). */
  action?: ReactNode;
  /** Scrolling ancestor to watch. Defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Px scrolled before the bar morphs into a pill. */
  threshold?: number;
  /** Max width of the floating pill, in px. */
  pillWidth?: number;
  /** "sticky" inside a scroller, "fixed" for the page, "absolute" to overlay a container. */
  position?: "sticky" | "fixed" | "absolute";
  /** Thin scroll-progress line along the bottom of the pill. */
  progress?: boolean;
  /** Progress line and active-link dot color. */
  accent?: string;
  className?: string;
}

const EASE = "ease-[cubic-bezier(.7,0,.2,1)]";

export function NavbarFlow({
  links,
  brand,
  action,
  scrollContainerRef,
  threshold = 40,
  pillWidth = 720,
  position = "sticky",
  progress = true,
  accent = "#a3e635",
  className,
}: NavbarFlowProps) {
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();

  useEffect(() => {
    const el = scrollContainerRef?.current ?? null;
    const target: HTMLElement | Window = el ?? window;
    let raf = 0;
    const read = () => {
      raf = 0;
      const top = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(top > threshold); // bails out when unchanged, so no per-frame renders
      root.current?.style.setProperty("--nf-progress", String(max > 0 ? Math.min(1, top / max) : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollContainerRef, threshold]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const pick = (i: number) => {
    setActive(i);
    setOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <header
        ref={root}
        data-scrolled={scrolled || undefined}
        className={cn("group/nf @container pointer-events-none inset-x-0 top-0 z-50 flex justify-center", position, className)}
        style={{ ["--nf-w" as string]: `${pillWidth}px`, ["--nf-progress" as string]: 0 } as CSSProperties}
      >
        <nav
          aria-label="Main"
          className={cn(
            "pointer-events-auto relative flex h-16 w-full max-w-full items-center gap-3 border border-transparent border-b-border bg-background/60 px-5 backdrop-blur-xl",
            "transition-[max-width,height,margin,border-radius,background-color,border-color,box-shadow,padding] duration-700 motion-reduce:transition-none",
            EASE,
            "group-data-[scrolled]/nf:mt-3 group-data-[scrolled]/nf:h-[52px] group-data-[scrolled]/nf:max-w-[min(var(--nf-w),calc(100%-24px))] group-data-[scrolled]/nf:rounded-[26px] group-data-[scrolled]/nf:border-border group-data-[scrolled]/nf:bg-card/70 group-data-[scrolled]/nf:pl-4 group-data-[scrolled]/nf:pr-2 group-data-[scrolled]/nf:shadow-[0_18px_50px_-18px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]",
          )}
        >
          {brand && <div className="flex shrink-0 items-center">{brand}</div>}

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 @3xl:flex" onPointerLeave={() => setHover(null)}>
            {links.map((l, i) => (
              <li key={l.href + l.label} className="relative">
                <a
                  href={l.href}
                  aria-current={i === active ? "page" : undefined}
                  onClick={() => pick(i)}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={cn(
                    "relative block rounded-full px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {hover === i && (
                    <motion.span
                      layoutId={`${id}-hover`}
                      className="absolute inset-0 -z-10 rounded-full bg-foreground/[.07]"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  {l.label}
                  {i === active && (
                    <motion.span
                      layoutId={`${id}-dot`}
                      aria-hidden
                      className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full"
                      style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            {action}
            <button
              ref={toggle}
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={`${id}-menu`}
              data-open={open || undefined}
              onClick={() => setOpen((o) => !o)}
              className="group/btn relative grid size-9 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-foreground/[.07] focus-visible:ring-2 focus-visible:ring-ring @3xl:hidden"
            >
              {[-1, 1].map((s) => (
                <span
                  key={s}
                  aria-hidden
                  className="absolute h-[1.5px] w-[18px] translate-y-[var(--y)] rounded-full bg-current transition-[translate,rotate] duration-300 group-data-[open]/btn:translate-y-0 group-data-[open]/btn:rotate-[var(--r)] ease-[cubic-bezier(.7,0,.2,1)] motion-reduce:transition-none"
                  style={{ ["--y" as string]: `${s * 3.5}px`, ["--r" as string]: `${s * -45}deg` }}
                />
              ))}
            </button>
          </div>

          {progress && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 -bottom-px h-px origin-left opacity-0 transition-opacity duration-500 group-data-[scrolled]/nf:opacity-100"
              style={{ transform: "scaleX(var(--nf-progress))", background: `linear-gradient(90deg, transparent, ${accent})` }}
            />
          )}

          <AnimatePresence>
            {open && (
              <motion.div
                id={`${id}-menu`}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-x-2 top-full mt-2 origin-top overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)] @3xl:hidden"
              >
                <ul>
                  {links.map((l, i) => (
                    <motion.li
                      key={l.href + l.label}
                      initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.04 + i * 0.045, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <a
                        href={l.href}
                        aria-current={i === active ? "page" : undefined}
                        onClick={() => pick(i)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium outline-none transition-colors hover:bg-foreground/[.06] focus-visible:ring-2 focus-visible:ring-ring",
                          i === active ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {l.label}
                        {i === active && <span aria-hidden className="size-1.5 rounded-full" style={{ background: accent }} />}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </MotionConfig>
  );
}
