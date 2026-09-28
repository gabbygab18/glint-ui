"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

const css = `
.decorated-text{position:relative;display:inline-block;padding:.12em .4em;--dt-e:cubic-bezier(.2,.8,.2,1)}
.decorated-text .dt-box{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.decorated-text .dt-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset var(--dt-d) var(--dt-e)}
.decorated-text[data-on] .dt-draw{stroke-dashoffset:0}
.decorated-text .dt-tick{position:absolute;width:.32em;height:.32em;border:0 solid var(--dt-c);opacity:0;transform:translate(var(--dt-in-x),var(--dt-in-y));transition:opacity .3s ease calc(var(--dt-d)*.35),transform calc(var(--dt-d)*.8) var(--dt-e) calc(var(--dt-d)*.35)}
.decorated-text[data-on] .dt-tick{opacity:1;transform:none}
.decorated-text[data-on]:hover .dt-tick{transform:translate(calc(var(--dt-in-x)*-.6),calc(var(--dt-in-y)*-.6))}
.decorated-text .dt-handle{position:absolute;width:7px;height:7px;margin:-3.5px;background:var(--background,#000);border:1.5px solid var(--dt-c);transform:scale(0);transition:transform .35s var(--dt-e) calc(var(--dt-d)*.85)}
.decorated-text[data-on] .dt-handle{transform:scale(1)}
.decorated-text .dt-spark{position:absolute;width:.42em;height:.42em;color:var(--dt-c);transform:scale(0) rotate(-90deg);transition:transform .6s var(--dt-e) calc(var(--dt-d) + var(--dt-sd,0ms))}
.decorated-text[data-on] .dt-spark{transform:scale(1) rotate(0)}
.decorated-text[data-on] .dt-spark svg{animation:dt-twinkle 2.4s ease-in-out calc(var(--dt-d) + var(--dt-sd,0ms) + .6s) infinite}
@keyframes dt-twinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(.55) rotate(45deg);opacity:.6}}
@media (prefers-reduced-motion:reduce){.decorated-text *{transition:none!important;animation:none!important}}
`;

export interface DecoratedTextProps {
  text: string;
  /** Which decorations to draw. */
  decoration?: "all" | "brackets" | "box" | "sparkles";
  /** Draw in when scrolled into view, or only while hovered. */
  trigger?: "view" | "hover";
  /** Decoration color. */
  color?: string;
  /** Draw-in duration, in ms. */
  duration?: number;
  className?: string;
}

const Spark = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" style={{ display: "block" }}>
    <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
  </svg>
);

const corners: (CSSProperties & { x: string; y: string })[] = [
  { top: "-0.22em", left: "-0.22em", borderTopWidth: 2, borderLeftWidth: 2, x: "0.3em", y: "0.3em" },
  { top: "-0.22em", right: "-0.22em", borderTopWidth: 2, borderRightWidth: 2, x: "-0.3em", y: "0.3em" },
  { bottom: "-0.22em", left: "-0.22em", borderBottomWidth: 2, borderLeftWidth: 2, x: "0.3em", y: "-0.3em" },
  { bottom: "-0.22em", right: "-0.22em", borderBottomWidth: 2, borderRightWidth: 2, x: "-0.3em", y: "-0.3em" },
];

export function DecoratedText({
  text,
  decoration = "all",
  trigger = "view",
  color = "#a3e635",
  duration = 900,
  className,
}: DecoratedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const mask = `dt${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || trigger !== "view") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  const on = trigger === "view" ? inView : hover;
  const show = (d: "brackets" | "box" | "sparkles") => decoration === d || decoration === "all";

  return (
    <span
      ref={ref}
      className={`decorated-text ${className ?? ""}`}
      data-on={on || undefined}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{ "--dt-c": color, "--dt-d": `${duration}ms` } as CSSProperties}
    >
      <style href="decorated-text" precedence="default">
        {css}
      </style>
      {text}
      <span aria-hidden>
        {show("box") && (
          <svg className="dt-box">
            <mask id={mask} maskUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%">
              <rect className="dt-draw" x="0" y="0" width="100%" height="100%" pathLength={1} fill="none" stroke="#fff" strokeWidth={6} />
            </mask>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="6 5"
              mask={`url(#${mask})`}
            />
          </svg>
        )}
        {decoration === "box" &&
          ["0% 0%", "100% 0%", "0% 100%", "100% 100%"].map((p) => {
            const [left, top] = p.split(" ");
            return <span key={p} className="dt-handle" style={{ left, top }} />;
          })}
        {show("brackets") &&
          corners.map(({ x, y, ...pos }, i) => (
            <span key={i} className="dt-tick" style={{ ...pos, "--dt-in-x": x, "--dt-in-y": y } as CSSProperties} />
          ))}
        {show("sparkles") && (
          <>
            <span className="dt-spark" style={{ top: "-0.55em", right: "-0.6em" }}>
              <Spark />
            </span>
            <span className="dt-spark" style={{ bottom: "-0.35em", left: "-0.55em", width: "0.26em", height: "0.26em", "--dt-sd": "150ms" } as CSSProperties}>
              <Spark />
            </span>
            <span className="dt-spark" style={{ top: "-0.2em", right: "-0.95em", width: "0.2em", height: "0.2em", "--dt-sd": "280ms" } as CSSProperties}>
              <Spark />
            </span>
          </>
        )}
      </span>
    </span>
  );
}
