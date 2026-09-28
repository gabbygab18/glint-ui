"use client";

import { useEffect, useRef } from "react";

export interface CountUpProps {
  to: number;
  from?: number;
  /** Ms from start to finish. */
  duration?: number;
  decimals?: number;
  separator?: string;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  duration = 2000,
  decimals = 0,
  separator = ",",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    n
      .toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      .replace(/,/g, separator);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    // Writes straight to the DOM: no React re-render per frame.
    const start = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(from + (to - from) * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, duration, decimals, separator]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(from)}
    </span>
  );
}
