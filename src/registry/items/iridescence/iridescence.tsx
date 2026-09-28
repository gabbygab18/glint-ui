"use client";

import { useEffect, useRef } from "react";

export interface IridescenceProps {
  /** Multiplies the interference colors; white keeps the full rainbow. */
  tint?: string;
  /** Flow speed multiplier. */
  speed?: number;
  /** Pattern zoom; higher means smaller swirls. */
  scale?: number;
  /** How much of the surface shows color vs. dark oil, 0-1. */
  coverage?: number;
  /** How strongly the cursor swirls the film. */
  mouseStrength?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uTint;
uniform float uScale;
uniform float uCoverage;
uniform float uMouseStrength;

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = (gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5)) * uScale * 2.2;
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0) * uScale * 2.2;
  float t = uTime * 0.25;

  // cursor stirs the film
  vec2 dm = p - m;
  float a = exp(-dot(dm, dm) * 0.8 / (uScale * uScale)) * uHover * uMouseStrength * 1.6;
  p = m + mat2(cos(a), -sin(a), sin(a), cos(a)) * dm;

  // layered sine domain warp: smooth, flowing, cheap
  vec2 w = p;
  for (int i = 1; i < 7; i++) {
    float fi = float(i);
    w += vec2(0.75 / fi * sin(fi * w.y * 0.9 + t + 0.7 * fi), 0.75 / fi * cos(fi * w.x * 0.8 - t * 0.85 + 1.3 * fi));
  }
  float thick = 0.5 + 0.3 * sin(w.x * 1.2 + w.y * 0.4) + 0.2 * cos(w.y * 1.5 - t * 0.5);

  // thin-film interference: phase shifts per wavelength
  vec3 film = 0.5 + 0.5 * cos(6.2831853 * (thick * 2.6 + vec3(0.0, 0.2, 0.42)));
  film = pow(film, vec3(1.3)) * vec3(1.0, 0.92, 1.05);
  film = mix(vec3(dot(film, vec3(0.333))), film, 0.8) * uTint;

  float oil = 0.5 + 0.5 * sin(w.x * 0.55 - w.y * 0.45 + t * 0.4);
  float slick = smoothstep(1.0 - uCoverage - 0.2, 1.0 - uCoverage + 0.35, oil);
  vec3 base = vec3(0.015, 0.016, 0.03) + film * 0.06;
  vec3 col = mix(base, film * 0.85, slick);
  // glossy sheen along the film ridges
  col += vec3(0.9, 0.95, 1.0) * pow(max(sin(w.x * 1.2 + w.y * 0.4 + 1.2), 0.0), 14.0) * 0.25 * slick;
  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - 0.5 * dot(v, v);
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

export function Iridescence({
  tint = "#ffffff",
  speed = 1,
  scale = 1,
  coverage = 0.5,
  mouseStrength = 1,
  className,
}: IridescenceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ tint, speed, scale, coverage, mouseStrength });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { tint, speed, scale, coverage, mouseStrength };
    redraw.current?.();
  }, [tint, speed, scale, coverage, mouseStrength]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uTint"), rgb(o.tint));
        gl.uniform1f(u("uScale"), Math.max(0.1, o.scale));
        gl.uniform1f(u("uCoverage"), o.coverage);
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
