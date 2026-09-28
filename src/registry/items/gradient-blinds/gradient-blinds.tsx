"use client";

import { useEffect, useRef } from "react";

export interface GradientBlindsProps {
  /** Four gradient colors, dark to light works best. */
  colors?: string[];
  /** Number of blind strips across the width. */
  stripes?: number;
  /** Strip angle in degrees; 0 is vertical. */
  angle?: number;
  /** How much each strip refracts the gradient behind it. */
  distortion?: number;
  spotlightColor?: string;
  /** Spotlight radius as a fraction of the height. */
  spotlightRadius?: number;
  /** Gradient drift speed multiplier. */
  speed?: number;
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
uniform vec3 uC3;
uniform vec3 uSpot;
uniform float uStripes;
uniform float uAngle;
uniform float uDistort;
uniform float uRadius;

vec3 pal(float k) {
  k = clamp(k, 0.0, 1.0) * 3.0;
  return k < 1.0 ? mix(uC0, uC1, k) : (k < 2.0 ? mix(uC1, uC2, k - 1.0) : mix(uC2, uC3, k - 2.0));
}
vec3 gradient(vec2 p, float t) {
  float k = 0.5 + 0.5 * sin(p.x * 1.3 + sin(p.y * 1.7 + t * 0.5) * 0.9 + t * 0.3)
                + 0.18 * sin(p.y * 2.3 - t * 0.4);
  return pal(pow(clamp(k, 0.0, 1.0), 1.5));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  float t = uTime;
  float c = cos(uAngle), s = sin(uAngle);
  mat2 R = mat2(c, s, -s, c);
  vec2 r = R * p;

  float x = r.x * uStripes / asp;
  float u = fract(x);
  // each slat refracts the gradient sideways, like fluted glass
  vec2 off = vec2((u - 0.5) * uDistort * 0.35 * asp / uStripes * 6.0, 0.0);
  vec3 col = gradient(p + off * R, t);

  // slat shading: lit leading edge, shadowed trailing edge, hairline gap
  float shade = 0.55 + 0.5 * smoothstep(0.0, 1.0, u) - 0.45 * pow(u, 14.0);
  col *= shade;

  vec2 m = mix(vec2(sin(t * 0.37) * 0.35 * asp, cos(t * 0.29) * 0.25), (uMouse - 0.5) * vec2(asp, 1.0), uHover);
  float spot = exp(-dot(p - m, p - m) / (uRadius * uRadius));
  col = col * (0.75 + 0.5 * spot) + uSpot * spot * (0.04 + 0.22 * pow(u, 4.0));

  col += (hash(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * 0.025;
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

export function GradientBlinds({
  colors = ["#12092e", "#6d28d9", "#ec4899", "#fdba74"],
  stripes = 16,
  angle = 0,
  distortion = 1,
  spotlightColor = "#ffffff",
  spotlightRadius = 0.45,
  speed = 1,
  className,
}: GradientBlindsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, stripes, angle, distortion, spotlightColor, spotlightRadius, speed });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colors, stripes, angle, distortion, spotlightColor, spotlightRadius, speed };
    redraw.current?.();
  }, [colors, stripes, angle, distortion, spotlightColor, spotlightRadius, speed]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const c = o.colors.length ? o.colors : ["#000000", "#ffffff"];
        for (let i = 0; i < 4; i++) gl.uniform3fv(u(`uC${i}`), rgb(c[Math.round((i * (c.length - 1)) / 3)]));
        gl.uniform3fv(u("uSpot"), rgb(o.spotlightColor));
        gl.uniform1f(u("uStripes"), Math.max(1, o.stripes));
        gl.uniform1f(u("uAngle"), (o.angle * Math.PI) / 180);
        gl.uniform1f(u("uDistort"), o.distortion);
        gl.uniform1f(u("uRadius"), Math.max(0.05, o.spotlightRadius));
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
