"use client";

import { useEffect, useRef } from "react";

export interface GrainGradientProps {
  /** Three or four mesh colors. */
  colors?: string[];
  /** Morph speed multiplier. */
  speed?: number;
  /** Film grain strength, 0-1. */
  grain?: number;
  /** How much the color fields swirl into each other. */
  warp?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uGrain;
uniform float uWarp;
uniform float uSeed;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float t = uTime * 0.18;

  vec2 q = p + uWarp * 0.22 * vec2(
    sin(p.y * 2.1 + t * 1.3) + sin(p.y * 3.7 - t * 0.9 + p.x),
    cos(p.x * 1.8 - t * 1.1) + sin(p.x * 3.1 + t * 0.7 - p.y));

  // four color points drifting on slow Lissajous paths, blended by inverse distance
  vec2 h = vec2(asp * 0.5, 0.5);
  vec2 P0 = vec2(sin(t * 0.9) * 0.7, cos(t * 0.7) * 0.6) * h + vec2(-0.3, 0.2) * h;
  vec2 P1 = vec2(cos(t * 0.6 + 1.0) * 0.7, sin(t * 0.8 + 2.0) * 0.6) * h + vec2(0.35, 0.25) * h;
  vec2 P2 = vec2(sin(t * 0.5 + 4.0) * 0.7, cos(t * 0.9 + 1.0) * 0.6) * h + vec2(0.3, -0.3) * h;
  vec2 P3 = vec2(cos(t * 0.8 + 3.0) * 0.7, sin(t * 0.55 + 5.0) * 0.6) * h + vec2(-0.35, -0.25) * h;
  vec4 w = 1.0 / (vec4(dot(q - P0, q - P0), dot(q - P1, q - P1), dot(q - P2, q - P2), dot(q - P3, q - P3)) + 0.02);
  w = w * w;
  vec3 col = (uC0 * w.x + uC1 * w.y + uC2 * w.z + uC3 * w.w) / (w.x + w.y + w.z + w.w);

  // soft light pooling and vignette
  col *= 0.9 + 0.2 * smoothstep(0.9, 0.0, length(p - P1));
  col *= 1.0 - 0.25 * dot(p, p);

  float g = hash(gl_FragCoord.xy + uSeed * 97.0) - 0.5;
  col += g * uGrain * 0.22 * (0.5 + 0.8 * (1.0 - dot(col, vec3(0.3333))));
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

export function GrainGradient({
  colors = ["#ff6a3d", "#c026d3", "#4338ca", "#0c0a1f"],
  speed = 1,
  grain = 0.5,
  warp = 1,
  className,
}: GrainGradientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, speed, grain, warp });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colors, speed, grain, warp };
    redraw.current?.();
  }, [colors, speed, grain, warp]);

  useEffect(() => {
    let frame = 0;
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const c = o.colors.length ? o.colors : ["#000000"];
        for (let i = 0; i < 4; i++) gl.uniform3fv(u(`uC${i}`), rgb(c[i % c.length]));
        gl.uniform1f(u("uGrain"), o.grain);
        gl.uniform1f(u("uWarp"), o.warp);
        // new grain pattern every other frame, independent of speed
        gl.uniform1f(u("uSeed"), Math.floor(frame++ / 2) % 64);
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
