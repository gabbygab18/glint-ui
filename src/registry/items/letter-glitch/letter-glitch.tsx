"use client";

import { useEffect, useRef } from "react";

export interface LetterGlitchProps {
  /** Palette the glyphs flicker between. */
  colors?: string[];
  /** Background color behind the grid (also used by the vignette). */
  background?: string;
  /** Glitch rate multiplier; 0 freezes the grid. */
  speed?: number;
  /** Glyph size in px. */
  fontSize?: number;
  /** Characters to pick from. */
  characters?: string;
  /** Fade glyph colors instead of snapping them. */
  smooth?: boolean;
  /** Darken the edges. */
  vignette?: boolean;
  className?: string;
}

type RGB = [number, number, number];

function rgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const DEFAULT_COLORS = ["#1f3b2f", "#4ade80", "#38bdf8", "#a78bfa"];
const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}/\\=+?;:";

export function LetterGlitch({
  colors = DEFAULT_COLORS,
  background = "#05070a",
  speed = 1,
  fontSize = 16,
  characters = DEFAULT_CHARS,
  smooth = true,
  vignette = true,
  className,
}: LetterGlitchProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, background, speed, characters, smooth });
  const rebuild = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, background, speed, characters, smooth };
  }, [colors, background, speed, characters, smooth]);
  useEffect(() => {
    rebuild.current?.();
  }, [colors, background, characters]);

  useEffect(() => {
    const el = host.current!;
    const canvas = el.querySelector("canvas")!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let glyph: string[] = [];
    // Per cell: current color, target color, fade progress (1 = settled).
    let cur = new Float32Array(0);
    let tgt = new Float32Array(0);
    let prog = new Float32Array(0);
    let palette: RGB[] = [];
    let raf = 0;
    let visible = true;
    let last = 0;
    let budget = 0;

    const pick = () => palette[(Math.random() * palette.length) | 0];
    const char = () => {
      const c = opts.current.characters || DEFAULT_CHARS;
      return c[(Math.random() * c.length) | 0];
    };

    const paint = (i: number) => {
      const x = (i % cols) * cw;
      const y = ((i / cols) | 0) * ch;
      ctx.fillStyle = opts.current.background;
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = `rgb(${cur[i * 3] | 0},${cur[i * 3 + 1] | 0},${cur[i * 3 + 2] | 0})`;
      ctx.fillText(glyph[i], x + cw / 2, y + ch / 2);
    };

    const paintAll = () => {
      ctx.fillStyle = opts.current.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < cols * rows; i++) paint(i);
    };

    const build = () => {
      const size = Math.max(6, fontSize) * dpr;
      cw = Math.ceil(size * 0.72);
      ch = Math.ceil(size * 1.15);
      cols = Math.ceil(canvas.width / cw);
      rows = Math.ceil(canvas.height / ch);
      const n = cols * rows;
      palette = (opts.current.colors.length ? opts.current.colors : DEFAULT_COLORS).map(rgb);
      glyph = Array.from({ length: n }, char);
      cur = new Float32Array(n * 3);
      tgt = new Float32Array(n * 3);
      prog = new Float32Array(n).fill(1);
      for (let i = 0; i < n; i++) {
        const c = pick();
        for (let k = 0; k < 3; k++) cur[i * 3 + k] = tgt[i * 3 + k] = c[k];
      }
      ctx.font = `600 ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      paintAll();
    };

    const step = (dt: number) => {
      const n = cols * rows;
      // Roughly every cell changes once per second at speed 1.
      budget += n * dt * opts.current.speed;
      const smoothOn = opts.current.smooth;
      while (budget >= 1) {
        budget--;
        const i = (Math.random() * n) | 0;
        glyph[i] = char();
        const c = pick();
        for (let k = 0; k < 3; k++) tgt[i * 3 + k] = c[k];
        prog[i] = 0;
        if (!smoothOn) {
          for (let k = 0; k < 3; k++) cur[i * 3 + k] = c[k];
          prog[i] = 1;
          paint(i);
        }
      }
      if (!smoothOn) return;
      const a = 1 - Math.exp(-dt * 8);
      for (let i = 0; i < n; i++) {
        if (prog[i] >= 1) continue;
        prog[i] = Math.min(1, prog[i] + dt * 2.5);
        for (let k = 0; k < 3; k++) {
          const j = i * 3 + k;
          cur[j] = prog[i] >= 1 ? tgt[j] : cur[j] + (tgt[j] - cur[j]) * a;
        }
        paint(i);
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      step(dt);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      build();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else stop();
    });
    io.observe(el);
    rebuild.current = build;

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      rebuild.current = null;
    };
  }, [fontSize]);

  return (
    <div
      ref={host}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background }}
    >
      <canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {vignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 25%, ${background} 95%)`,
          }}
        />
      )}
    </div>
  );
}
