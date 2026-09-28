"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ProfileCardProps {
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  /** Portrait that fills the card. */
  avatarUrl?: string;
  /** Small avatar in the contact bar. Defaults to `avatarUrl`. */
  miniAvatarUrl?: string;
  contactText?: string;
  onContactClick?: () => void;
  /** Max tilt in degrees. */
  maxTilt?: number;
  /** Strength of the holographic foil, 0 to 1. */
  foil?: number;
  /** Show the bottom contact bar. */
  showUserInfo?: boolean;
  className?: string;
}

const RAINBOW =
  "repeating-linear-gradient(115deg, hsl(340 95% 58%) 0px, hsl(35 100% 58%) 22px, hsl(90 85% 55%) 44px, hsl(175 90% 50%) 66px, hsl(220 95% 62%) 88px, hsl(285 90% 64%) 110px, hsl(340 95% 58%) 132px)";

const FOIL_SHIFT = "translate3d(calc(var(--nx, 0) * -40%), calc(var(--ny, 0) * -40%), 0)";

export function ProfileCard({
  name = "Maya Laurent",
  title = "Product Designer",
  handle = "mayalaurent",
  status = "Available for work",
  avatarUrl,
  miniAvatarUrl,
  contactText = "Contact",
  onContactClick,
  maxTilt = 14,
  foil = 0.8,
  showUserInfo = true,
  className,
}: ProfileCardProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const c = card.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Pointer position in 0..1 (target) and the smoothed value we render.
    const target = { x: 0.5, y: 0.5, a: 0 };
    const cur = { x: 0.5, y: 0.5, a: 0 };
    let raf = 0;
    let intro = 0;

    const apply = () => {
      const dx = cur.x - 0.5;
      const dy = cur.y - 0.5;
      c.style.transform = `rotateX(${-dy * 2 * maxTilt}deg) rotateY(${dx * 2 * maxTilt}deg)`;
      c.style.setProperty("--px", `${cur.x * 100}%`);
      c.style.setProperty("--py", `${cur.y * 100}%`);
      c.style.setProperty("--nx", dx.toFixed(4));
      c.style.setProperty("--ny", dy.toFixed(4));
      c.style.setProperty("--pa", `${cur.a}`);
    };

    const tick = () => {
      let moving = false;
      for (const k of ["x", "y", "a"] as const) {
        const d = target[k] - cur[k];
        cur[k] += d * 0.12;
        if (Math.abs(d) > 0.0005) moving = true;
      }
      apply();
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (reduce) {
        Object.assign(cur, target);
        apply();
      } else if (!raf) raf = requestAnimationFrame(tick);
    };

    const move = (e: PointerEvent) => {
      cancelAnimationFrame(intro);
      intro = 0;
      const r = el.getBoundingClientRect();
      target.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      target.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      target.a = 1;
      kick();
    };
    const leave = () => {
      target.x = 0.5;
      target.y = 0.5;
      target.a = 0;
      kick();
    };

    // A short intro sweep so the foil catches the light once when the card appears.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || reduce) return;
      io.disconnect();
      const t0 = performance.now();
      const sweep = (now: number) => {
        const t = Math.min(1, (now - t0) / 1600);
        const s = Math.sin(t * Math.PI);
        target.x = 0.5 + Math.cos(t * Math.PI * 2 - Math.PI / 2) * 0.35 * s;
        target.y = 0.5 + Math.sin(t * Math.PI * 2) * 0.2 * s;
        target.a = s * 0.9;
        kick();
        intro = t < 1 ? requestAnimationFrame(sweep) : 0;
      };
      intro = requestAnimationFrame(sweep);
    });

    apply();
    io.observe(el);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(intro);
      io.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [maxTilt]);

  const f = Math.max(0, Math.min(1, foil));

  return (
    <div ref={wrap} className={cn("relative w-[21rem] max-w-full", className)} style={{ perspective: 900 }}>
      <div
        ref={card}
        className="relative aspect-[5/7] w-full overflow-hidden rounded-[2rem] bg-neutral-950 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] will-change-transform"

      >
        {/* Backdrop: deep gradient behind the portrait. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, #3b2d7a 0%, transparent 60%), radial-gradient(90% 60% at 100% 100%, #0f5f6b 0%, transparent 70%), #0b0b14",
          }}
        />
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={name}
            draggable={false}
            className="absolute inset-0 size-full object-cover"
            style={{ maskImage: "linear-gradient(to bottom, #000 45%, transparent 92%)" }}
          />
        )}

        {/* Holographic foil: an oversized rainbow sheet that slides against the tilt (no tiling seams). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-color-dodge"
          style={{
            opacity: `calc(${f * 0.1} + var(--pa, 0) * ${f * 0.42})`,
            maskImage: "radial-gradient(farthest-corner at var(--px, 50%) var(--py, 50%), #000 5%, rgba(0,0,0,.3) 80%)",
          }}
        >
          <div className="absolute inset-[-50%]" style={{ backgroundImage: RAINBOW, transform: FOIL_SHIFT }} />
        </div>
        {/* Same bands in overlay so the color also reads on the dark parts of the photo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-overlay"
          style={{ opacity: `calc(${f * 0.06} + var(--pa, 0) * ${f * 0.28})` }}
        >
          <div className="absolute inset-[-50%]" style={{ backgroundImage: RAINBOW, transform: FOIL_SHIFT }} />
        </div>
        {/* Fine etched lines, barely there, like the texture of a real foil card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            opacity: `calc(var(--pa, 0) * ${f * 0.6})`,
            backgroundImage: "repeating-linear-gradient(-35deg, rgba(255,255,255,.35) 0 1px, transparent 1px 4px)",
          }}
        />
        {/* Glitter: two offset dot grids that twinkle as the angle changes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: `calc(var(--pa, 0) * ${f * 0.42})`,
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,.9) 0 0.6px, transparent 1.2px), radial-gradient(circle at 70% 60%, rgba(200,230,255,.8) 0 0.5px, transparent 1px)",
            backgroundSize: "7px 7px, 11px 11px",
            backgroundPosition: "calc(var(--px, 50%) * -0.2) calc(var(--py, 50%) * -0.2), calc(var(--px, 50%) * 0.3) 0",
            maskImage: "radial-gradient(circle at var(--px, 50%) var(--py, 50%), #000, transparent 55%)",
          }}
        />
        {/* Glare that follows the pointer. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: "calc(.2 + var(--pa, 0) * .8)",
            background:
              "radial-gradient(farthest-corner circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,.85) 0%, rgba(255,255,255,.25) 25%, rgba(0,0,0,.45) 90%)",
          }}
        />

        {/* Header */}
        <div className="absolute inset-x-0 top-0 p-7 text-center">
          <h3 className="text-3xl font-semibold tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,.45)]">{name}</h3>
          <p className="mt-1 text-sm font-medium text-white/75">{title}</p>
        </div>

        {showUserInfo && (
          <div
            className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2.5 pr-2.5 backdrop-blur-xl"
          >
            {(miniAvatarUrl ?? avatarUrl) && (
              <img src={miniAvatarUrl ?? avatarUrl} alt="" draggable={false} className="size-10 rounded-full border border-white/20 object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">@{handle}</p>
              <p className="flex items-center gap-1.5 truncate text-xs text-white/65">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
                  <span className="relative size-1.5 rounded-full bg-emerald-400" />
                </span>
                {status}
              </p>
            </div>
            <button
              type="button"
              onClick={onContactClick}
              className="shrink-0 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-neutral-950 outline-none transition-transform hover:scale-[1.04] active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              {contactText}
            </button>
          </div>
        )}

        {/* Rim light */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15" />
      </div>
    </div>
  );
}
