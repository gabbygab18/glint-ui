"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const css = `
.mh-fill{position:absolute;inset:0;color:transparent;-webkit-background-clip:text;background-clip:text;
-webkit-mask-image:linear-gradient(100deg,#000 40%,transparent 60%);mask-image:linear-gradient(100deg,#000 40%,transparent 60%);
-webkit-mask-size:300% 100%;mask-size:300% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:100% 0;mask-position:100% 0}
.mh-fill[data-state=shown]{animation:mh-reveal var(--mh-r) cubic-bezier(.65,0,.35,1) forwards,var(--mh-flow)}
.mh-fill[data-state=loop]{animation:mh-loop calc(var(--mh-r) * 2.6) cubic-bezier(.65,0,.35,1) infinite alternate,var(--mh-flow)}
@keyframes mh-reveal{to{-webkit-mask-position:0 0;mask-position:0 0}}
@keyframes mh-loop{0%,12%{-webkit-mask-position:100% 0;mask-position:100% 0}62%,100%{-webkit-mask-position:0 0;mask-position:0 0}}
@keyframes mh-slide{to{background-position:200% 0}}
@keyframes mh-pan{from{background-position:0% 50%}to{background-position:100% 50%}}
@media (prefers-reduced-motion:reduce){.mh-fill[data-state]{animation:none;-webkit-mask-image:none;mask-image:none}}
`;

export interface MaskedHeadingProps {
  text?: string;
  /** Gradient stops flowing through the letters. */
  colors?: string[];
  /** Image URL to fill the letters with instead of the gradient. */
  image?: string;
  /** Seconds for the reveal sweep. */
  revealDuration?: number;
  /** Seconds per gradient (or image pan) cycle. */
  flowDuration?: number;
  /** Reveal once on view, or sweep in and out forever. */
  trigger?: "view" | "loop";
  /** Faint ghost of the letters before they are revealed. */
  outline?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
}

export function MaskedHeading({
  text = "Made to be seen",
  colors = ["#bef264", "#22d3ee", "#a78bfa", "#f472b6"],
  image,
  revealDuration = 1.8,
  flowDuration = 6,
  trigger = "view",
  outline = true,
  as: Tag = "h2",
  className,
}: MaskedHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stops = colors.length ? [...colors, colors[0]] : ["currentColor", "currentColor"];
  const fill: CSSProperties = image
    ? { backgroundImage: `url("${image}")`, backgroundSize: "cover", backgroundPosition: "0% 50%" }
    : { backgroundImage: `linear-gradient(90deg, ${stops.join(", ")})`, backgroundSize: "200% 100%", backgroundRepeat: "repeat" };
  const flow = image ? `mh-pan ${flowDuration}s ease-in-out infinite alternate` : `mh-slide ${flowDuration}s linear infinite`;

  return (
    <Tag ref={ref as never} className={className}>
      <style href="masked-heading" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      <span aria-hidden style={{ position: "relative", display: "inline-block" }}>
        <span
          style={{
            WebkitTextFillColor: outline ? "color-mix(in oklab, currentColor 9%, transparent)" : "transparent",
          }}
        >
          {text}
        </span>
        <span
          key={`${trigger}|${revealDuration}`}
          className="mh-fill"
          data-state={shown ? (trigger === "loop" ? "loop" : "shown") : undefined}
          style={{ ...fill, "--mh-r": `${revealDuration}s`, "--mh-flow": flow } as CSSProperties}
        >
          {text}
        </span>
      </span>
    </Tag>
  );
}
