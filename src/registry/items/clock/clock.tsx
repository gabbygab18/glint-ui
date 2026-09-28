"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ClockProps {
  /** IANA time zone, e.g. "Asia/Tokyo". Defaults to the viewer's zone. */
  timeZone?: string;
  /** Caption on the face. Defaults to the city from `timeZone`. */
  label?: string;
  /** Diameter in px. */
  size?: number;
  /** Continuous sweeping second hand; off = ticking with a small bounce. */
  sweep?: boolean;
  /** Show the second hand. */
  showSeconds?: boolean;
  /** Digital readout on the face. */
  showDigital?: boolean;
  /** 12h readout with AM/PM. */
  hour12?: boolean;
  /** Draw 12, 3, 6, 9 numerals. */
  showNumbers?: boolean;
  /** Second hand color. */
  accent?: string;
  className?: string;
}

/** Offset (ms) between the zone's wall clock and UTC at `now`. */
function zoneOffset(timeZone: string | undefined, now: number) {
  if (!timeZone) return -new Date(now).getTimezoneOffset() * 60000;
  try {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })
        .formatToParts(new Date(now))
        .map((x) => [x.type, +x.value]),
    );
    return Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) - (now - (now % 1000));
  } catch {
    return -new Date(now).getTimezoneOffset() * 60000;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");
const turn = (el: SVGGElement | null, deg: number) => {
  if (el) el.style.transform = `rotate(${deg}deg)`;
};
/** Hands pivot on the face centre (100,100 in the 200 viewBox). */
const PIVOT = { transformBox: "view-box", transformOrigin: "100px 100px" } as const;
const TICKS = Array.from({ length: 60 }, (_, i) => i);

export function Clock({
  timeZone,
  label,
  size = 280,
  sweep = true,
  showSeconds = true,
  showDigital = true,
  hour12 = false,
  showNumbers = true,
  accent = "#ff5a36",
  className,
}: ClockProps) {
  const root = useRef<HTMLDivElement>(null);
  const hourRef = useRef<SVGGElement>(null);
  const minRef = useRef<SVGGElement>(null);
  const secRef = useRef<SVGGElement>(null);
  const digitalRef = useRef<HTMLSpanElement>(null);
  const handsRef = useRef<SVGGElement>(null);
  const uid = useId().replace(/:/g, "");
  const caption = label ?? (timeZone ? timeZone.split("/").pop()!.replace(/_/g, " ") : "Local");

  useEffect(() => {
    const el = root.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = sweep && !reduce;
    let offset = zoneOffset(timeZone, Date.now());
    let offsetAt = Date.now();
    let raf = 0;
    let timer = 0;
    let lastSec = -1;
    let lastMin = -1;
    let turns = 0; // full minutes elapsed, so the ticking hand never spins backwards at :00

    const frame = () => {
      const now = Date.now();
      if (now - offsetAt > 60000) {
        offset = zoneOffset(timeZone, now); // DST changes
        offsetAt = now;
      }
      const t = now + offset;
      const ms = ((t % 86400000) + 86400000) % 86400000;
      const h = ms / 3600000;
      const m = (ms % 3600000) / 60000;
      const s = (ms % 60000) / 1000;
      const whole = Math.floor(s);

      if (whole !== lastSec) {
        if (whole < lastSec) turns++;
        lastSec = whole;
        const H = Math.floor(h);
        const M = Math.floor(m);
        if (digitalRef.current) {
          const hh = hour12 ? (H % 12 || 12) : H;
          digitalRef.current.textContent = `${hour12 ? hh : pad(hh)}:${pad(M)}${showSeconds ? `:${pad(whole)}` : ""}${hour12 ? (H < 12 ? " AM" : " PM") : ""}`;
        }
        if (M !== lastMin) {
          lastMin = M;
          el.setAttribute("aria-label", `${caption || timeZone || "Local time"}: ${hour12 ? H % 12 || 12 : pad(H)}:${pad(M)}${hour12 ? (H < 12 ? " AM" : " PM") : ""}`);
        }
        if (!smooth) turn(secRef.current, (whole + turns * 60) * 6);
      }
      turn(hourRef.current, (h % 12) * 30);
      turn(minRef.current, m * 6);
      if (smooth) turn(secRef.current, s * 6);
    };

    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      stop();
      frame();
      if (smooth) raf = requestAnimationFrame(loop);
      else timer = window.setInterval(frame, 250);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };

    frame();
    handsRef.current!.style.opacity = "1"; // hands stay hidden until they show the real time
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);
    return () => {
      stop();
      io.disconnect();
    };
  }, [timeZone, sweep, hour12, showSeconds, caption]);

  const tickHand = !sweep;

  return (
    <div
      ref={root}
      role="img"
      aria-label={caption || timeZone || "Clock"}
      className={cn("relative shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id={`${uid}f`} cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="var(--card)" />
            <stop offset="100%" stopColor="var(--background)" />
          </radialGradient>
          <filter id={`${uid}s`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
            <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* bezel + face */}
        <circle cx="100" cy="100" r="99" fill="var(--border)" />
        <circle cx="100" cy="100" r="96.5" fill={`url(#${uid}f)`} />
        <circle cx="100" cy="100" r="96.5" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="3" style={{ filter: "blur(2px)" }} />

        {TICKS.map((i) => {
          const hour = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={hour ? 9 : 10}
              x2="100"
              y2={hour ? 21 : 15}
              stroke="currentColor"
              strokeWidth={hour ? 2.6 : 1}
              strokeLinecap="round"
              className={hour ? "text-foreground" : "text-muted-foreground/50"}
              transform={`rotate(${i * 6} 100 100)`}
            />
          );
        })}

        {showNumbers &&
          [12, 3, 6, 9].map((n, i) => {
            const a = (i * Math.PI) / 2;
            return (
              <text
                key={n}
                x={100 + Math.sin(a) * 66}
                y={100 - Math.cos(a) * 66}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-[17px] font-semibold tabular-nums"
              >
                {n}
              </text>
            );
          })}

        <text x="100" y="64" textAnchor="middle" className="fill-muted-foreground text-[8.5px] font-medium tracking-[0.2em] uppercase">
          {caption}
        </text>

        <g ref={handsRef} className="transition-opacity duration-500" style={{ opacity: 0 }}>
          {/* hour */}
          <g ref={hourRef} filter={`url(#${uid}s)`} style={PIVOT}>
            <line x1="100" y1="112" x2="100" y2="52" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" className="text-foreground" />
          </g>
          {/* minute */}
          <g ref={minRef} filter={`url(#${uid}s)`} style={PIVOT}>
            <line x1="100" y1="114" x2="100" y2="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground" />
          </g>
          {/* second */}
          {showSeconds && (
            <g
              ref={secRef}
              filter={`url(#${uid}s)`}
              style={tickHand ? { ...PIVOT, transition: "transform .32s cubic-bezier(.4,2.2,.5,1)" } : PIVOT}
            >
              <line x1="100" y1="124" x2="100" y2="16" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="100" cy="124" r="3.4" fill={accent} />
            </g>
          )}
          <circle cx="100" cy="100" r="5" fill={showSeconds ? accent : "currentColor"} className="text-foreground" />
          <circle cx="100" cy="100" r="1.8" className="fill-card" />
        </g>
      </svg>

      {showDigital && (
        <span
          ref={digitalRef}
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-md bg-muted/80 px-2 py-0.5 font-mono font-medium text-foreground tabular-nums"
          style={{ top: "66%", fontSize: Math.max(10, size * 0.05) }}
        >
          --:--
        </span>
      )}
    </div>
  );
}
