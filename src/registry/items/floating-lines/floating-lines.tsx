"use client";

import { useEffect, useRef } from "react";

export interface FloatingLinesProps {
  /** Up to three colors blended across each ribbon of lines. */
  colors?: string[];
  /** Lines per depth layer (there are three layers). */
  lineCount?: number;
  /** Line core width in px. */
  lineWidth?: number;
  /** Wave height multiplier. */
  amplitude?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** How strongly lines part around the cursor. */
  bend?: number;
  /** How far layers shift with the cursor. */
  parallax?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uLines;
uniform float uWidth;
uniform float uAmp;
uniform float uBend;
uniform float uParallax;

vec3 pal(float k) {
  return k < 0.5 ? mix(uC0, uC1, k * 2.0) : mix(uC1, uC2, k * 2.0 - 1.0);
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  float px = 1.0 / uRes.y;
  vec3 col = vec3(0.0);

  for (int l = 0; l < 3; l++) {
    float fl = float(l);                 // 0 = far, 2 = near
    float depth = 0.45 + 0.275 * fl;
    vec2 q = p + (m * uHover) * uParallax * 0.06 * (fl - 0.8);
    float t = uTime * (0.16 + 0.09 * fl);
    float center = (1.0 - fl) * 0.2;
    float f1 = 1.15 + 0.35 * fl;
    float f2 = 2.6 - 0.45 * fl;
    for (int i = 0; i < 40; i++) {
      if (float(i) >= uLines) break;
      float k = float(i) / max(uLines - 1.0, 1.0);
      float ph = k * 1.7 + fl * 2.3;
      float a1 = 0.15 * uAmp * depth;
      float a2 = 0.045 * uAmp;
      float s1 = q.x * f1 + t + ph;
      float s2 = q.x * f2 - t * 1.4 + ph * 1.9;
      float y = center + (k - 0.5) * 0.26 * depth + a1 * sin(s1) + a2 * sin(s2);
      float dy = a1 * f1 * cos(s1) + a2 * f2 * cos(s2);
      // part around the cursor
      vec2 dm = vec2(q.x, y) - m;
      y += dm.y / (abs(dm.y) + 0.03) * 0.07 * uBend * uHover * exp(-dot(dm, dm) / 0.035);
      float d = abs(q.y - y) / sqrt(1.0 + dy * dy);
      float w = uWidth * px * (0.55 + 0.6 * depth);
      float I = exp(-d * d / (w * w)) + 0.12 * exp(-d / (w * 7.0));
      I *= (0.25 + 0.75 * depth * depth) * (0.35 + 0.65 * sin(3.14159 * k));
      col += pal(k) * I;
    }
  }

  float ex = gl_FragCoord.x / uRes.x;
  col *= smoothstep(0.0, 0.12, ex) * smoothstep(1.0, 0.88, ex);
  col = 1.0 - exp(-col * 1.3);
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
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

export function FloatingLines({
  colors = ["#a78bfa", "#22d3ee", "#c6ff3d"],
  lineCount = 14,
  lineWidth = 1.2,
  amplitude = 1,
  speed = 1,
  bend = 1,
  parallax = 1,
  className,
}: FloatingLinesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, lineCount, lineWidth, amplitude, speed, bend, parallax });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colors, lineCount, lineWidth, amplitude, speed, bend, parallax };
    redraw.current?.();
  }, [colors, lineCount, lineWidth, amplitude, speed, bend, parallax]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const c = o.colors.length ? o.colors : ["#ffffff"];
        for (let i = 0; i < 3; i++) gl.uniform3fv(u(`uC${i}`), rgb(c[Math.min(i, c.length - 1)]));
        gl.uniform1f(u("uLines"), Math.max(1, o.lineCount));
        gl.uniform1f(u("uWidth"), Math.max(0.3, o.lineWidth));
        gl.uniform1f(u("uAmp"), o.amplitude);
        gl.uniform1f(u("uBend"), o.bend);
        gl.uniform1f(u("uParallax"), o.parallax);
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
