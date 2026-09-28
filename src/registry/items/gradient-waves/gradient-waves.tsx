"use client";

import { useEffect, useRef } from "react";

export interface GradientWavesProps {
  /** One color per wave layer, back to front (up to six). */
  colors?: string[];
  /** Wave height multiplier. */
  amplitude?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Depth shadow each wave casts on the one behind, 0-1. */
  shadow?: number;
  /** Vertical position of the top wave, 0 (bottom) to 1 (top). */
  height?: number;
  className?: string;
}

const FRAG = `
precision highp float;
float sq(float v) { return v * v; }
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uCol[6];
uniform float uCount;
uniform float uAmp;
uniform float uShadow;
uniform float uHeight;

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  float x = uv.x * asp;
  float px = 1.5 / uRes.y;
  float t = uTime;

  vec3 col = mix(uCol[0] * 0.28, uCol[0] * 0.06, uv.y);
  col += uCol[0] * 0.25 * exp(-sq((uv.y - uHeight) * 3.0));

  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    if (fi >= uCount) break;
    float k = fi / max(uCount - 1.0, 1.0);
    float sp = 0.22 + 0.16 * fi;
    float base = mix(uHeight, 0.16, k);
    float lift = 0.05 * uHover * exp(-sq((x - uMouse.x * asp) * 2.0)) * (0.5 + k);
    float y = base + lift + uAmp * (
        0.055 * sin(x * (1.1 + 0.22 * fi) + t * sp + fi * 1.7)
      + 0.03 * sin(x * (2.6 - 0.25 * fi) - t * sp * 1.3 + fi * 4.1)
      + 0.012 * sin(x * 5.3 + t * sp * 2.1 + fi));
    float d = uv.y - y;

    // this wave shadows whatever is behind it, just above its crest
    col *= 1.0 - uShadow * 0.55 * exp(-max(d, 0.0) * 22.0) * step(0.0, d);

    vec3 c = uCol[i];
    vec3 body = mix(c * 1.12 + 0.03, c * 0.5, smoothstep(0.0, 0.35, -d));
    body += c * 0.35 * exp(d * 60.0) * step(d, 0.0);
    col = mix(col, body, smoothstep(px, -px, d));
  }
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

export function GradientWaves({
  colors = ["#312e81", "#5b21b6", "#a21caf", "#db2777", "#f97316"],
  amplitude = 1,
  speed = 1,
  shadow = 0.6,
  height = 0.72,
  className,
}: GradientWavesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, amplitude, speed, shadow, height });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colors, amplitude, speed, shadow, height };
    redraw.current?.();
  }, [colors, amplitude, speed, shadow, height]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const c = (o.colors.length ? o.colors : ["#6366f1"]).slice(0, 6);
        const flat = new Float32Array(18);
        c.forEach((hex, i) => flat.set(rgb(hex), i * 3));
        gl.uniform3fv(u("uCol"), flat);
        gl.uniform1f(u("uCount"), c.length);
        gl.uniform1f(u("uAmp"), o.amplitude);
        gl.uniform1f(u("uShadow"), o.shadow);
        gl.uniform1f(u("uHeight"), o.height);
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
