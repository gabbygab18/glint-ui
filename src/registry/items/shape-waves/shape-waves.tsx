"use client";

import { useEffect, useRef } from "react";

export type ShapeWavesShape = "mixed" | "circle" | "square" | "triangle";

export interface ShapeWavesProps {
  /** Color on the left. */
  colorA?: string;
  /** Color on the right. */
  colorB?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Which shape to draw; "mixed" alternates by row. */
  shape?: ShapeWavesShape;
  /** Grid spacing in CSS pixels. */
  cellSize?: number;
  /** How far shapes bob, as a share of the cell. */
  amplitude?: number;
  /** How much shapes grow near the cursor. */
  mouseStrength?: number;
  className?: string;
}

const SHAPES: Record<ShapeWavesShape, number> = { mixed: 0, circle: 1, square: 2, triangle: 3 };

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uA;
uniform vec3 uB;
uniform float uCell;
uniform float uAmp;
uniform float uShape;
uniform float uMouseStrength;

float sdTri(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

float sdShape(vec2 q, float r, float kind) {
  if (kind < 0.5) return length(q) - r;
  if (kind < 1.5) {
    vec2 d = abs(q) - vec2(r * 0.72);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r * 0.14;
  }
  return sdTri(q + vec2(0.0, r * 0.2), r * 1.05) - r * 0.08;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 mouse = uMouse * uRes;
  float t = uTime;
  vec2 cell0 = floor(fc / uCell);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 id = cell0 + vec2(float(i), float(j));
      vec2 center = (id + 0.5) * uCell;
      vec2 n = center / uRes.y;
      float wave = sin(n.x * 7.0 - t * 2.0 + id.y * 0.45) * 0.6 + sin(n.x * 3.0 + n.y * 4.0 - t * 1.3) * 0.4;
      center.y += wave * uCell * 0.45 * uAmp;
      vec2 md = (center - mouse) / (uCell * 3.5);
      float boost = exp(-dot(md, md)) * uHover * uMouseStrength;
      float lift = 0.5 + 0.5 * wave;
      float size = uCell * (0.14 + 0.1 * lift + 0.14 * boost);
      float kind = uShape > 0.5 ? uShape - 1.0 : mod(id.y, 3.0);
      float a = kind > 0.5 ? wave * 0.7 + t * 0.25 : 0.0;
      vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * (fc - center);
      float sd = sdShape(q, size, kind);
      float cov = clamp(0.5 - sd, 0.0, 1.0);
      float glow = exp(-max(sd, 0.0) / (size * 0.35)) * 0.22 * (0.4 + lift);
      float g = smoothstep(0.0, 1.0, fc.x / uRes.x + wave * 0.12);
      vec3 c = mix(uA, uB, g) * (0.45 + 0.55 * lift) + vec3(boost * 0.35);
      float v = max(cov, glow);
      col = max(col, c * v);
      alpha = max(alpha, v);
    }
  }
  gl_FragColor = vec4(min(col, vec3(alpha)), alpha);
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

export function ShapeWaves({
  colorA = "#f472b6",
  colorB = "#60a5fa",
  speed = 1,
  shape = "mixed",
  cellSize = 32,
  amplitude = 1,
  mouseStrength = 1,
  className,
}: ShapeWavesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colorA, colorB, speed, shape, cellSize, amplitude, mouseStrength });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colorA, colorB, speed, shape, cellSize, amplitude, mouseStrength };
    redraw.current?.();
  }, [colorA, colorB, speed, shape, cellSize, amplitude, mouseStrength]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gl.uniform3fv(u("uA"), rgb(o.colorA));
        gl.uniform3fv(u("uB"), rgb(o.colorB));
        gl.uniform1f(u("uCell"), Math.max(8, o.cellSize) * dpr);
        gl.uniform1f(u("uAmp"), o.amplitude);
        gl.uniform1f(u("uShape"), SHAPES[o.shape] ?? 0);
        gl.uniform1f(u("uMouseStrength"), o.mouseStrength);
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
