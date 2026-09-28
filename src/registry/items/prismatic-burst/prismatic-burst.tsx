"use client";

import { useEffect, useRef } from "react";

export interface PrismaticBurstProps {
  /** Multiplies the ray colors; white keeps the full spectrum. */
  tint?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Number of main rays (rounded). */
  rays?: number;
  /** Strength of the chromatic split on ray edges. */
  dispersion?: number;
  /** Strength of the outward pulses, 0-1. */
  pulse?: number;
  /** Brightness. */
  intensity?: number;
  /** How far the burst center drifts toward the cursor, 0-1. */
  followMouse?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uTint;
uniform float uRays;
uniform float uDisp;
uniform float uPulse;
uniform float uIntensity;
uniform float uFollow;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

// ray field at angle a / radius r; noise is sampled on a circle so it is seamless
float rays(float a, float r, float t) {
  vec2 c = vec2(cos(a), sin(a));
  float n = noise(c * 2.5 + t * 0.3);
  float n2 = noise(c * 7.0 - t * 0.5 + 11.0);
  float big = pow(0.5 + 0.5 * sin(a * uRays + n * 6.0 + t * 0.15), 7.0);
  float thin = pow(0.5 + 0.5 * sin(a * uRays * 3.0 + n2 * 10.0 - t * 0.25), 24.0) * 0.5;
  float wave = 1.0 + uPulse * 0.55 * sin(r * 10.0 - t * 3.2 + n * 3.0);
  return (big + thin) * (0.3 + n2) * wave;
}

vec3 hue(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  vec2 q = p - m * uHover * uFollow;
  float t = uTime;
  float r = length(q);
  float a = atan(q.y, q.x);

  // chromatic dispersion: each channel sees the rays slightly rotated and scaled
  float k = uDisp * 0.02 * (0.2 + r);
  vec3 col = vec3(
    rays(a - k, r * (1.0 - 0.04 * uDisp), t),
    rays(a, r, t),
    rays(a + k, r * (1.0 + 0.04 * uDisp), t)
  );
  col *= mix(vec3(1.0), 0.35 + hue(fract(a / 6.2831853 + t * 0.03)), 0.45);
  col *= uTint;

  float breath = 1.0 + uPulse * 0.18 * sin(t * 1.6);
  col *= breath / (1.0 + r * r * 5.0) * smoothstep(0.0, 0.12, r);
  col += uTint * (0.025 / (r + 0.025)) * 0.55 * breath;

  col = 1.0 - exp(-col * uIntensity * 1.2);
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

export function PrismaticBurst({
  tint = "#ffffff",
  speed = 1,
  rays = 16,
  dispersion = 1,
  pulse = 0.6,
  intensity = 1,
  followMouse = 0.2,
  className,
}: PrismaticBurstProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ tint, speed, rays, dispersion, pulse, intensity, followMouse });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { tint, speed, rays, dispersion, pulse, intensity, followMouse };
    redraw.current?.();
  }, [tint, speed, rays, dispersion, pulse, intensity, followMouse]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uTint"), rgb(o.tint));
        // integer count keeps the pattern seamless across the -PI/PI seam
        gl.uniform1f(u("uRays"), Math.max(1, Math.round(o.rays)));
        gl.uniform1f(u("uDisp"), o.dispersion);
        gl.uniform1f(u("uPulse"), o.pulse);
        gl.uniform1f(u("uIntensity"), o.intensity);
        gl.uniform1f(u("uFollow"), o.followMouse);
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
