"use client";

import { useEffect, useRef } from "react";

export interface SlicedWavesProps {
  /** First palette color. */
  colorA?: string;
  /** Second palette color. */
  colorB?: string;
  /** Third palette color. */
  colorC?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of horizontal strips. */
  slices?: number;
  /** How far strips slide sideways. */
  shift?: number;
  /** Wave zoom; higher means tighter waves. */
  scale?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uSlices;
uniform float uShift;
uniform float uScale;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 pal(float x) {
  x = fract(x) * 3.0;
  vec3 c = mix(uA, uB, smoothstep(0.0, 1.0, x));
  c = mix(c, uC, smoothstep(1.0, 2.0, x));
  return mix(c, uA, smoothstep(2.0, 3.0, x));
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime;

  float s = uv.y * uSlices;
  float id = floor(s);
  float f = fract(s);

  // each strip glides between random offsets on its own schedule
  float tt = t * 0.3 + hash(vec2(id, 3.7)) * 10.0;
  float k = floor(tt);
  float e = smoothstep(0.0, 1.0, fract(tt));
  e = e * e * (3.0 - 2.0 * e);
  float off = (mix(hash(vec2(id, k)), hash(vec2(id, k + 1.0)), e) - 0.5) * uShift * 0.8;

  vec2 p = vec2(uv.x * asp + off, uv.y) * 2.0 * uScale;
  float v = p.x * 0.3
    + 0.24 * sin(p.x * 2.1 + t * 0.55)
    + 0.18 * sin(p.y * 3.3 - t * 0.45 + p.x * 0.8)
    + 0.1 * sin((p.x - p.y) * 4.2 + t * 0.8);

  vec3 col = pal(v * 1.1 + t * 0.02);
  float lines = 0.5 + 0.5 * sin(v * 42.0);
  col *= 0.88 + 0.12 * smoothstep(0.2, 0.9, lines);

  // strip shading: lit top edge, soft shadow and a hairline gap at the bottom
  float px = uSlices / uRes.y;
  col *= 0.72 + 0.28 * smoothstep(0.0, 0.8, f);
  col *= smoothstep(0.0, 1.5 * px, f);
  col += smoothstep(1.0 - 3.0 * px, 1.0 - 1.0 * px, f) * 0.12;

  vec2 q = uv - 0.5;
  col *= 1.0 - dot(q, q) * 0.8;
  gl_FragColor = vec4(col, 1.0);
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

export function SlicedWaves({
  colorA = "#0ea5e9",
  colorB = "#8b5cf6",
  colorC = "#f43f5e",
  speed = 1,
  slices = 14,
  shift = 1,
  scale = 1,
  className,
}: SlicedWavesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colorA, colorB, colorC, speed, slices, shift, scale });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colorA, colorB, colorC, speed, slices, shift, scale };
    redraw.current?.();
  }, [colorA, colorB, colorC, speed, slices, shift, scale]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uA"), rgb(o.colorA));
        gl.uniform3fv(u("uB"), rgb(o.colorB));
        gl.uniform3fv(u("uC"), rgb(o.colorC));
        gl.uniform1f(u("uSlices"), Math.max(1, Math.round(o.slices)));
        gl.uniform1f(u("uShift"), o.shift);
        gl.uniform1f(u("uScale"), Math.max(0.1, o.scale));
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
