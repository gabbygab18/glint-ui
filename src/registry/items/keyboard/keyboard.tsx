"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type KeyDef = {
  code: string;
  label: string;
  /** Shifted legend shown above the label. */
  top?: string;
  /** Width in key units. */
  w?: number;
  /** Character typed (unshifted / shifted). Omit for modifiers. */
  ch?: string;
  sh?: string;
  align?: "left" | "right";
};

const k = (code: string, label: string, ch?: string, sh?: string, top?: string): KeyDef => ({ code, label, ch, sh, top });
const letters = (codes: string) => codes.split("").map((c) => k(`Key${c}`, c, c.toLowerCase(), c));
const sym = (code: string, ch: string, sh: string): KeyDef => k(code, ch, ch, sh, sh);

const ROWS: KeyDef[][] = [
  [
    sym("Backquote", "`", "~"),
    ...[..."1234567890"].map((d, i) => sym(`Digit${d}`, d, "!@#$%^&*()"[i])),
    sym("Minus", "-", "_"),
    sym("Equal", "=", "+"),
    { code: "Backspace", label: "delete", w: 2, align: "right" },
  ],
  [
    { code: "Tab", label: "tab", w: 1.5, align: "left" },
    ...letters("QWERTYUIOP"),
    sym("BracketLeft", "[", "{"),
    sym("BracketRight", "]", "}"),
    { ...sym("Backslash", "\\", "|"), w: 1.5 },
  ],
  [
    { code: "CapsLock", label: "caps lock", w: 1.75, align: "left" },
    ...letters("ASDFGHJKL"),
    sym("Semicolon", ";", ":"),
    sym("Quote", "'", '"'),
    { code: "Enter", label: "return", w: 2.25, align: "right" },
  ],
  [
    { code: "ShiftLeft", label: "shift", w: 2.25, align: "left" },
    ...letters("ZXCVBNM"),
    sym("Comma", ",", "<"),
    sym("Period", ".", ">"),
    sym("Slash", "/", "?"),
    { code: "ShiftRight", label: "shift", w: 2.75, align: "right" },
  ],
  [
    { code: "Fn", label: "fn" },
    { code: "ControlLeft", label: "control" },
    { code: "AltLeft", label: "option" },
    { code: "MetaLeft", label: "⌘", w: 1.25 },
    { code: "Space", label: "", w: 5.5, ch: " ", sh: " " },
    { code: "MetaRight", label: "⌘", w: 1.25 },
    { code: "AltRight", label: "option" },
  ],
];

const ALL = new Map(ROWS.flat().map((d) => [d.code, d]));
for (const [code, label] of [["ArrowLeft", "◀"], ["ArrowRight", "▶"], ["ArrowUp", "▲"], ["ArrowDown", "▼"]])
  ALL.set(code, { code, label });

export interface KeyboardProps {
  /** Key unit in px; the board is 15 units wide. */
  size?: number;
  /** Backlight color of pressed keys. */
  accent?: string;
  /** Keycap finish. */
  variant?: "graphite" | "silver";
  /** Show the typed-text strip above the keys. */
  showDisplay?: boolean;
  /**
   * Listen to the whole window instead of only while the keyboard has focus.
   * Off by default so the widget never swallows typing elsewhere on the page.
   */
  global?: boolean;
  /** Fired for every key press (physical or clicked) with its KeyboardEvent.code. */
  onKey?: (code: string) => void;
  className?: string;
}

export function Keyboard({
  size = 40,
  accent = "#c6ff3d",
  variant = "graphite",
  showDisplay = true,
  global = false,
  onKey,
  className,
}: KeyboardProps) {
  const [down, setDown] = useState<Set<string>>(() => new Set());
  const [caps, setCaps] = useState(false);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const shiftRef = useRef(false);
  const capsRef = useRef(caps);
  useEffect(() => {
    capsRef.current = caps;
  }, [caps]);
  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  });

  const press = (code: string) => {
    if (!ALL.has(code)) return;
    setDown((s) => (s.has(code) ? s : new Set(s).add(code)));
    onKeyRef.current?.(code);
    if (code === "ShiftLeft" || code === "ShiftRight") shiftRef.current = true;
    if (code === "CapsLock") setCaps((c) => !c);
    if (code === "Backspace") setText((t) => t.slice(0, -1));
    if (code === "Enter") setText("");
    const def = ALL.get(code)!;
    if (def.ch) {
      const letter = /^Key/.test(code);
      const shifted = shiftRef.current !== (letter && capsRef.current);
      const c = shifted ? def.sh! : def.ch;
      setText((t) => (t + c).slice(-48));
    }
  };
  const release = (code: string) => {
    if (code === "ShiftLeft" || code === "ShiftRight") shiftRef.current = false;
    setDown((s) => {
      if (!s.has(code) && !code.startsWith("Meta")) return s;
      // macOS drops keyup for keys held with ⌘, so releasing ⌘ clears everything.
      if (code.startsWith("Meta")) return new Set();
      const n = new Set(s);
      n.delete(code);
      return n;
    });
  };
  const handlers = useRef({ press, release });
  useEffect(() => {
    handlers.current = { press, release };
  });

  useEffect(() => {
    if (!global) return;
    const kd = (e: KeyboardEvent) => !e.repeat && handlers.current.press(e.code);
    const ku = (e: KeyboardEvent) => handlers.current.release(e.code);
    const clear = () => setDown(new Set());
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", clear);
    };
  }, [global]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (global || e.metaKey || e.ctrlKey) return;
    if (e.code !== "Tab" && ALL.has(e.code)) e.preventDefault(); // keep Tab so focus can leave
    if (!e.repeat) press(e.code);
  };
  const onKeyUp = (e: ReactKeyboardEvent) => !global && release(e.code);

  const gap = Math.round(size * 0.14);
  const silver = variant === "silver";
  const vars = {
    "--u": `${size}px`,
    "--g": `${gap}px`,
    "--accent": accent,
    "--cap": silver ? "linear-gradient(#fbfbfa,#e6e6e3)" : "linear-gradient(#34353a,#26272b)",
    "--cap-edge": silver ? "#b9b9b4" : "#101113",
    "--legend": silver ? "#3b3c40" : "#c9cbd1",
  } as CSSProperties;

  const cap = (def: KeyDef, extra?: CSSProperties, compact = false) => {
    const on = down.has(def.code);
    const w = def.w ?? 1;
    const isLetter = /^Key/.test(def.code);
    return (
      <span
        key={def.code}
        data-on={on || undefined}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget.closest("[data-kb]") as HTMLElement | null)?.focus({ preventScroll: true });
          press(def.code);
        }}
        onPointerUp={() => release(def.code)}
        onPointerLeave={() => down.has(def.code) && release(def.code)}
        className={cn(
          "kb-key relative flex cursor-pointer flex-col rounded-[calc(var(--u)*0.16)] px-[calc(var(--u)*0.16)] py-[calc(var(--u)*0.1)] leading-none select-none",
          def.align === "right" ? "items-end justify-end" : def.align === "left" ? "items-start justify-end" : "items-center justify-center",
        )}
        style={{
          width: `calc(var(--u) * ${w} + var(--g) * ${w - 1})`,
          height: compact ? "calc((var(--u) - var(--g) / 2) / 2)" : "var(--u)",
          ...extra,
        }}
      >
        {def.top && <span className="kb-legend text-[calc(var(--u)*0.26)] opacity-60">{def.top}</span>}
        <span
          className={cn(
            "kb-legend",
            isLetter ? "text-[calc(var(--u)*0.34)] font-medium" : def.top ? "text-[calc(var(--u)*0.3)]" : "text-[calc(var(--u)*0.25)]",
          )}
        >
          {def.label}
        </span>
        {def.code === "CapsLock" && (
          <span
            className="absolute top-[calc(var(--u)*0.16)] left-[calc(var(--u)*0.16)] size-[calc(var(--u)*0.1)] rounded-full transition-[background-color,box-shadow] duration-200"
            style={{ background: caps ? accent : "rgba(128,128,128,.35)", boxShadow: caps ? `0 0 6px ${accent}` : undefined }}
          />
        )}
      </span>
    );
  };

  const arrows = (
    <span className="flex items-end gap-(--g)" key="arrows">
      {cap(ALL.get("ArrowLeft")!, undefined, true)}
      <span className="flex flex-col gap-[calc(var(--g)/2)]">
        {cap(ALL.get("ArrowUp")!, undefined, true)}
        {cap(ALL.get("ArrowDown")!, undefined, true)}
      </span>
      {cap(ALL.get("ArrowRight")!, undefined, true)}
    </span>
  );

  return (
    <div
      data-kb
      tabIndex={0}
      role="group"
      aria-label="Interactive keyboard. Focus it and type, or click the keys."
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (!global) setDown(new Set());
      }}
      className={cn("relative w-fit rounded-[calc(var(--u)*0.45)] outline-none", className)}
      style={vars}
    >
      <style href="glint-keyboard" precedence="default">{`
.kb-key{background:var(--cap);color:var(--legend);box-shadow:0 calc(var(--u)*.06) 0 var(--cap-edge),0 calc(var(--u)*.09) calc(var(--u)*.14) rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.14);transition:translate .12s cubic-bezier(.3,.7,.4,1.4),box-shadow .5s ease,color .5s ease}
.kb-key .kb-legend{transition:text-shadow .5s ease}
.kb-key:hover{filter:brightness(1.08)}
.kb-key[data-on]{translate:0 calc(var(--u)*.05);color:var(--accent);box-shadow:0 calc(var(--u)*.01) 0 var(--cap-edge),0 0 calc(var(--u)*.45) color-mix(in oklab,var(--accent) 45%,transparent),inset 0 0 0 1px color-mix(in oklab,var(--accent) 70%,transparent),inset 0 0 calc(var(--u)*.3) color-mix(in oklab,var(--accent) 25%,transparent);transition-duration:.05s}
.kb-key[data-on] .kb-legend{text-shadow:0 0 calc(var(--u)*.2) var(--accent);transition-duration:.05s}
@keyframes kb-caret{50%{opacity:0}}
[data-kb]:focus-visible .kb-plate{outline:2px solid color-mix(in oklab,var(--accent) 45%,transparent);outline-offset:4px}
@media (prefers-reduced-motion:reduce){.kb-key,.kb-key .kb-legend{transition:none}}
`}</style>

      {/* aluminium plate */}
      <div
        className={cn(
          "relative flex flex-col gap-(--g) rounded-[inherit] p-[calc(var(--u)*0.32)] transition-shadow duration-300",
          silver
            ? "bg-[linear-gradient(180deg,#e9e9e6,#c9c9c4)] shadow-[0_24px_60px_-18px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-2px_4px_rgba(0,0,0,.12)]"
            : "bg-[linear-gradient(180deg,#1f2023,#131416)] shadow-[0_24px_60px_-18px_rgba(0,0,0,.8),inset_0_1px_0_rgba(255,255,255,.08),inset_0_-2px_4px_rgba(0,0,0,.5)]",
          "kb-plate",
        )}
      >
        {showDisplay && (
          <div
            className={cn(
              "mb-[calc(var(--g)*0.6)] flex h-[calc(var(--u)*1.05)] items-center gap-2 overflow-hidden rounded-[calc(var(--u)*0.22)] px-[calc(var(--u)*0.3)] font-mono text-[calc(var(--u)*0.36)]",
              silver ? "bg-[#d9d9d5] text-[#2a2b2f] shadow-[inset_0_2px_6px_rgba(0,0,0,.18)]" : "bg-black/50 text-[#e6e7ea] shadow-[inset_0_2px_8px_rgba(0,0,0,.7)]",
            )}
            aria-live="off"
          >
            <span
              aria-hidden
              className="size-[calc(var(--u)*0.14)] shrink-0 rounded-full transition-colors"
              style={{ background: focused || global ? accent : "rgba(128,128,128,.4)", boxShadow: focused || global ? `0 0 8px ${accent}` : undefined }}
            />
            <span className="min-w-0 flex-1 truncate whitespace-pre" dir="ltr">
              {text || <span className="opacity-40">{focused || global ? "Start typing…" : "Click here, then type"}</span>}
              {(focused || global) && (
                <span
                  aria-hidden
                  className="ml-px inline-block h-[1.05em] w-[0.1em] translate-y-[0.15em] animate-[kb-caret_1s_steps(1)_infinite]"
                  style={{ background: accent }}
                />
              )}
            </span>
          </div>
        )}
        {ROWS.map((row, i) => (
          <div key={i} className="flex gap-(--g)">
            {row.map((d) => cap(d))}
            {i === 4 && arrows}
          </div>
        ))}
      </div>
    </div>
  );
}
