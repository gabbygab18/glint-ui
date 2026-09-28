"use client";

import { useEffect, useRef, type ReactNode } from "react";

const PAD = 16;

/**
 * Painted bounds of everything a demo draws, in viewport px. Follows transforms and
 * absolutely positioned pieces, but not content its own container clips on purpose
 * (marquee tracks, carousels), hidden elements, or full-stage backgrounds.
 */
function paintedBounds(root: HTMLElement) {
  const b = { l: Infinity, t: Infinity, r: -Infinity, bt: -Infinity };
  let seen = 0;
  const walk = (el: Element, top: boolean) => {
    if (++seen > 2500) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return;
    if (top && (cs.position === "absolute" || cs.position === "fixed")) return; // backgrounds fill the stage
    if (cs.position === "fixed") return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      b.l = Math.min(b.l, r.left);
      b.t = Math.min(b.t, r.top);
      b.r = Math.max(b.r, r.right);
      b.bt = Math.max(b.bt, r.bottom);
    }
    const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible" || cs.clipPath !== "none";
    if (clips) return; // its descendants are cut to its box anyway
    for (const kid of Array.from(el.children)) walk(kid, false);
  };
  for (const kid of Array.from(root.children)) walk(kid, true);
  return b.l === Infinity ? null : b;
}

/**
 * Scales a demo down (never up) so everything it paints fits the stage, keeping it centred.
 * Uses CSS `zoom`, so layout shrinks along with the pixels.
 */
export function Fit({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const stage = el.parentElement ?? el;
    let zoom = 1;
    const fit = () => {
      if (!el.isConnected) return;
      el.style.zoom = "";
      const s = stage.getBoundingClientRect();
      const b = paintedBounds(el);
      let next = 1;
      if (b && s.width > 0 && s.height > 0) {
        const cx = s.left + s.width / 2;
        const cy = s.top + s.height / 2;
        const halfX = Math.max(cx - b.l, b.r - cx);
        const halfY = Math.max(cy - b.t, b.bt - cy);
        next = Math.max(0.35, Math.min(1, (s.width / 2 - PAD) / halfX, (s.height / 2 - PAD) / halfY));
      }
      if (Math.abs(next - zoom) > 0.02) zoom = next;
      el.style.zoom = zoom === 1 ? "" : String(zoom);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    const mo = new MutationObserver(fit); // lazy demo arrived or re-rendered
    mo.observe(el, { childList: true });
    // Entrance animations change what gets painted without resizing anything.
    const timers = [60, 400, 1200, 2600].map((ms) => window.setTimeout(fit, ms));
    return () => {
      ro.disconnect();
      mo.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={ref} data-fit className="grid w-full grid-cols-[minmax(0,1fr)] self-stretch place-items-center">
      {children}
    </div>
  );
}
