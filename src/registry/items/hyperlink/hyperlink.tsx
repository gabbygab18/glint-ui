"use client";

import { useEffect, useId, useRef, useState, type AnchorHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export interface HyperlinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  /** Headline of the hover preview card. No title and no description = no card. */
  previewTitle?: string;
  previewDescription?: string;
  /** Underline and arrow color. */
  color?: string;
  /** Show the nudging arrow. Defaults to true for external links. */
  arrow?: boolean;
  /** Ms of hover before the preview card opens. */
  delay?: number;
}

const css = `.hyperlink{background:linear-gradient(var(--hl),var(--hl)) 100% 100%/0% 1.5px no-repeat,linear-gradient(color-mix(in oklab,var(--hl) 30%,transparent),color-mix(in oklab,var(--hl) 30%,transparent)) 0 100%/100% 1px no-repeat;-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-size .4s cubic-bezier(.65,0,.35,1)}
.hyperlink:hover,.hyperlink:focus-visible{background-position:0 100%,0 100%;background-size:100% 1.5px,100% 1px}
.hyperlink-arrow{display:inline-block;transition:transform .35s cubic-bezier(.34,1.8,.64,1)}
.hyperlink:hover .hyperlink-arrow,.hyperlink:focus-visible .hyperlink-arrow{transform:translate(2px,-2px)}
@media (prefers-reduced-motion:reduce){.hyperlink,.hyperlink-arrow{transition:none}}`;

const hostOf = (href: string) => {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
};

// Deterministic hue per domain, so every site gets its own thumbnail color.
const hueOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

export function Hyperlink({
  href,
  children,
  previewTitle,
  previewDescription,
  color = "currentColor",
  arrow,
  delay = 250,
  className,
  style,
  onFocus,
  onBlur,
  ...props
}: HyperlinkProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const external = /^https?:\/\//.test(href);
  const showArrow = arrow ?? external;
  const hasCard = Boolean(previewTitle || previewDescription);
  const host = hostOf(href);
  const hue = hueOf(host);

  const show = () => {
    if (!hasCard) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 80);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span
      className="relative"
      onPointerEnter={show}
      onPointerLeave={hide}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <style href="hyperlink" precedence="default">
        {css}
      </style>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-describedby={open ? id : undefined}
        {...props}
        onFocus={(e) => {
          show();
          onFocus?.(e);
        }}
        onBlur={(e) => {
          hide();
          onBlur?.(e);
        }}
        className={`hyperlink rounded-sm pb-0.5 font-medium text-foreground no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className ?? ""}`}
        style={{ "--hl": color, ...style } as CSSProperties}
      >
        {children}
        {showArrow && (
          <span className="hyperlink-arrow ml-0.5 align-[-0.1em]" style={{ color }}>
            <ArrowUpRight aria-hidden className="size-[0.95em]" />
          </span>
        )}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            className="absolute bottom-full left-0 z-50 block w-72 pb-2.5"
            style={{ transformOrigin: "20% 100%", transformPerspective: 600 }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.92, rotateX: 18 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            <span className="block overflow-hidden rounded-xl border border-border bg-card text-left shadow-2xl shadow-black/30">
              <span
                aria-hidden
                className="block h-20"
                style={{
                  background: `radial-gradient(120% 140% at 0% 0%, hsl(${hue} 90% 70%), transparent 60%), radial-gradient(120% 140% at 100% 100%, hsl(${(hue + 60) % 360} 85% 55%), hsl(${(hue + 200) % 360} 60% 25%))`,
                }}
              />
              <span className="block p-3">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    aria-hidden
                    className="grid size-4 place-items-center rounded text-[10px] font-bold text-black uppercase"
                    style={{ background: `hsl(${hue} 90% 70%)` }}
                  >
                    {host[0]}
                  </span>
                  {host}
                </span>
                {previewTitle && <span className="mt-1.5 block text-sm font-semibold text-foreground">{previewTitle}</span>}
                {previewDescription && (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{previewDescription}</span>
                )}
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
