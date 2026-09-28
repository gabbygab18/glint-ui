"use client";

import { useEffect, useRef } from "react";

export interface RadarProps {
  /** Phosphor color. */
  color?: string;
  /** Sweep speed multiplier. */
  speed?: number;
  /** Number of range rings inside the scope. */
  rings?: number;
  /** Length of the fading sweep trail. */
  trail?: number;
  /** Number of contacts, 0-16. */
  blips?: number;
  /** Scope size, as a fraction of the container height. */
  size?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uRings;
uniform float uTrail;
uniform float uBlips;
uniform float uSize;

const float TAU = 6.2831853;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  float px = 1.0 / uRes.y;
  float R = 0.5 * uSize;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = uTime;

  // clockwise sweep; delta = how long ago (in radians) the beam passed this angle
  float sweep = mod(-t * 1.1, TAU);
  float delta = mod(a - sweep, TAU);
  float scope = 1.0 - smoothstep(R, R * 2.4, r) * 0.85;

  float I = 0.0;
  // beam + trail
  float beam = exp(-delta * 2.4 / uTrail);
  float inScope = mix(0.2, 1.0, 1.0 - smoothstep(R - px, R + px, r));
  float edge = min(delta, TAU - delta) * r;
  I += beam * 0.55 * scope * inScope;
  I += (1.0 - smoothstep(0.0, 2.5 * px, edge)) * 0.9 * scope * inScope;

  // range rings (continue faintly past the scope rim)
  float sp = R / uRings;
  float rd = abs(fract(r / sp + 0.5) - 0.5) * sp;
  I += (1.0 - smoothstep(0.0, 1.4 * px, rd)) * (0.18 + 0.35 * beam) * scope;

  // spokes every 30 degrees, stronger on the axes
  float seg = TAU / 12.0;
  float sd = abs(fract(a / seg + 0.5) - 0.5) * seg * r;
  float axis = step(abs(fract(a / (TAU / 4.0) + 0.5) - 0.5), 0.01);
  I += (1.0 - smoothstep(0.0, 1.1 * px, sd)) * (0.07 + 0.1 * axis) * step(r, R);

  // rim with bearing ticks
  float rim = abs(r - R);
  I += (1.0 - smoothstep(0.0, 1.8 * px, rim)) * 0.6;
  float tick5 = abs(fract(a / (TAU / 72.0) + 0.5) - 0.5) * (TAU / 72.0) * r;
  float tick30 = abs(fract(a / seg + 0.5) - 0.5) * seg * r;
  float inBand = step(R - 0.012, r) * step(r, R);
  float inBandL = step(R - 0.028, r) * step(r, R);
  I += (1.0 - smoothstep(0.0, 1.2 * px, tick5)) * inBand * 0.35;
  I += (1.0 - smoothstep(0.0, 1.4 * px, tick30)) * inBandL * 0.55;

  // contacts: light up when the beam passes, then fade with an expanding ping
  for (int i = 0; i < 16; i++) {
    if (float(i) >= uBlips) break;
    float fi = float(i);
    float ba = hash(fi + 1.3) * TAU + t * 0.02 * (hash(fi + 7.7) - 0.5);
    float br = (0.15 + 0.8 * hash(fi + 4.1)) * R;
    vec2 bp = br * vec2(cos(ba), sin(ba));
    float bd = mod(ba - sweep, TAU);
    float glow = 0.12 + exp(-bd * 0.6);
    float dist = length(p - bp);
    I += glow * (exp(-dist * dist / (2.2 * px * px * 9.0)) * 1.4 + exp(-dist / (8.0 * px)) * 0.35);
    float ping = bd * 0.035;
    I += exp(-abs(dist - ping) / (1.2 * px)) * exp(-bd * 2.2) * 0.6;
  }

  // phosphor background + scanlines
  I += 0.05 * (1.0 - smoothstep(0.0, R, r)) * step(r, R);
  I *= 0.92 + 0.08 * sin(gl_FragCoord.y * 1.6);

  vec3 col = uColor * I + vec3(1.0) * pow(max(I - 0.8, 0.0), 2.0) * 0.4;
  col = 1.0 - exp(-col * 1.4);
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

export function Radar({
  color = "#34d399",
  speed = 1,
  rings = 4,
  trail = 1,
  blips = 9,
  size = 0.85,
  className,
}: RadarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, rings, trail, blips, size });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { color, speed, rings, trail, blips, size };
    redraw.current?.();
  }, [color, speed, rings, trail, blips, size]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uColor"), rgb(o.color));
        gl.uniform1f(u("uRings"), Math.max(1, Math.round(o.rings)));
        gl.uniform1f(u("uTrail"), Math.max(0.1, o.trail));
        gl.uniform1f(u("uBlips"), Math.round(o.blips));
        gl.uniform1f(u("uSize"), Math.max(0.1, o.size));
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
