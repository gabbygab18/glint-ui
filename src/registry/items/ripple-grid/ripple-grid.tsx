"use client";

import { useEffect, useRef } from "react";

export interface RippleGridProps {
  /** Grid line color. */
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Grid cell size in CSS pixels. */
  cellSize?: number;
  /** How far the ripples bend the lines. */
  amplitude?: number;
  /** Ripple frequency; higher means tighter rings. */
  frequency?: number;
  /** Halo around the lines. */
  glow?: number;
  /** Strength of the ripples that follow the cursor. */
  mouseStrength?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uColor;
uniform float uCell;
uniform float uAmp;
uniform float uFreq;
uniform float uGlow;
uniform float uMouseStrength;
uniform float uDpr;

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 c = uRes * 0.5;
  vec2 mouse = uMouse * uRes;
  float t = uTime;
  float k = 6.2831853 * uFreq / (uCell * 4.0);

  // ripple from the center
  vec2 d0 = fc - c;
  float r0 = length(d0);
  float w0 = sin(r0 * k - t * 3.0) * exp(-r0 / (uRes.y * 0.8));
  vec2 disp = d0 / max(r0, 1.0) * w0 * uCell * 0.3 * uAmp;

  // ripple around the cursor
  vec2 d1 = fc - mouse;
  float r1 = length(d1);
  float w1 = sin(r1 * k * 1.4 - t * 5.0) * exp(-r1 / (uCell * 5.0)) * uHover * uMouseStrength;
  disp += d1 / max(r1, 1.0) * w1 * uCell * 0.4 * uAmp;

  vec2 g = (fc + disp - c) / uCell;
  vec2 gd = abs(fract(g + 0.5) - 0.5) * uCell;
  float dl = min(gd.x, gd.y);
  float line = 1.0 - smoothstep(0.0, 1.3 * uDpr, dl);
  float halo = exp(-dl / (uCell * 0.09 * max(uGlow, 0.01))) * uGlow;
  float node = exp(-length(gd) / (2.5 * uDpr));

  float h = clamp(0.5 + 0.5 * (w0 + w1), 0.0, 1.0);
  float lit = 0.25 + 0.75 * h;
  float fade = 1.0 - smoothstep(0.25, 0.85, length(d0 / uRes.y)) * 0.85;

  vec3 col = uColor * (line * lit * 0.9 + halo * lit * 0.35 + node * (0.3 + h)) * fade;
  col += vec3(1.0) * line * pow(h, 6.0) * 0.35 * fade;
  col = 1.0 - exp(-col * 1.3);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
`;

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

type Ptr = { x: number; y: number; hover: number };
type Uni = (name: string) => WebGLUniformLocation | null;

/** Full-screen shader canvas inside `host`: DPR-capped resize, offscreen pause, reduced motion, eased pointer. */
function runShader(host: HTMLElement, frag: string, speed: () => number, update: (gl: WebGLRenderingContext, u: Uni) => void) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  host.appendChild(canvas);

  const locs = new Map<string, WebGLUniformLocation | null>();
  const u: Uni = (n) => {
    if (!locs.has(n)) locs.set(n, gl.getUniformLocation(prog, n));
    return locs.get(n) ?? null;
  };
  const zone = host.parentElement ?? host;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ptr: Ptr = { x: 0.5, y: 0.5, hover: 0 };
  const goal: Ptr = { ...ptr };
  let raf = 0;
  let last = 0;
  let time = 0;

  const draw = () => {
    gl.uniform2f(u("uRes"), canvas.width, canvas.height);
    gl.uniform1f(u("uTime"), time);
    gl.uniform2f(u("uMouse"), ptr.x, ptr.y);
    gl.uniform1f(u("uHover"), ptr.hover);
    update(gl, u);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const k = 1 - Math.exp(-dt * 4);
    for (const key of ["x", "y", "hover"] as const) ptr[key] += (goal[key] - ptr[key]) * k;
    time += dt * speed();
    draw();
    raf = requestAnimationFrame(loop);
  };
  const run = (on: boolean) => {
    if (on && !raf && !reduced) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  };
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    goal.x = (e.clientX - r.left) / r.width;
    goal.y = 1 - (e.clientY - r.top) / r.height;
    goal.hover = 1;
  };
  const leave = () => {
    goal.hover = 0;
  };
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([e]) => run(e.isIntersecting));
  ro.observe(host);
  io.observe(host);
  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerleave", leave);
  return {
    redraw: () => {
      if (!raf) draw();
    },
    dispose: () => {
      run(false);
      ro.disconnect();
      io.disconnect();
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerleave", leave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function RippleGrid({
  color = "#8b5cf6",
  speed = 1,
  cellSize = 40,
  amplitude = 1,
  frequency = 1,
  glow = 1,
  mouseStrength = 1,
  className,
}: RippleGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, cellSize, amplitude, frequency, glow, mouseStrength });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { color, speed, cellSize, amplitude, frequency, glow, mouseStrength };
    redraw.current?.();
  }, [color, speed, cellSize, amplitude, frequency, glow, mouseStrength]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gl.uniform3fv(u("uColor"), rgb(o.color));
        gl.uniform1f(u("uCell"), Math.max(6, o.cellSize) * dpr);
        gl.uniform1f(u("uAmp"), o.amplitude);
        gl.uniform1f(u("uFreq"), Math.max(0.1, o.frequency));
        gl.uniform1f(u("uGlow"), o.glow);
        gl.uniform1f(u("uMouseStrength"), o.mouseStrength);
        gl.uniform1f(u("uDpr"), dpr);
      },
    );
    redraw.current = r?.redraw;
    return () => r?.dispose();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    />
  );
}
