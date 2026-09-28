"use client";

import { useEffect, useRef } from "react";

export interface PlasmaWaveProps {
  /** Color on one end of the band. */
  colorA?: string;
  /** Color on the other end of the band. */
  colorB?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Wave height multiplier. */
  amplitude?: number;
  /** Band thickness multiplier. */
  thickness?: number;
  /** Number of electric filaments around the core, 0-12. */
  filaments?: number;
  /** Brightness. */
  intensity?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uA;
uniform vec3 uB;
uniform float uAmp;
uniform float uThick;
uniform float uCount;
uniform float uIntensity;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
float noise(float x) {
  float i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  float t = uTime;
  float x = p.x * 2.5;

  float w = (sin(x * 1.6 + t * 0.9) * 0.55 + sin(x * 2.9 - t * 1.3) * 0.25 + sin(x * 0.7 + t * 0.4) * 0.4) * 0.11 * uAmp;
  // the band bends toward the cursor
  w += (m.y - w) * exp(-pow((p.x - m.x) * 3.0, 2.0)) * uHover * 0.55;

  float d = abs(p.y - w);
  float th = 0.01 * uThick;
  float core = th / (d + th * 0.25);
  float halo = exp(-d * d / (0.012 * uThick * uThick));

  float fil = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= uCount) break;
    float fi = float(i);
    float off = (noise(x * 1.7 + fi * 7.1 + t * (0.6 + 0.13 * fi)) - 0.5) * 0.2 * uThick;
    off += (noise(x * 7.0 - t * 3.0 + fi * 3.3) - 0.5) * 0.035 * uThick;
    float df = abs(p.y - w - off);
    float flick = 0.35 + 0.65 * noise(x * 2.5 + t * 2.2 + fi * 5.0);
    fil += 0.0014 / (df + 0.0012) * flick;
  }

  vec3 tint = mix(uA, uB, 0.5 + 0.5 * sin(x * 0.8 + t * 0.5));
  vec3 col = tint * (core * 0.35 + halo * 0.55 + fil * 0.22);
  col += vec3(1.0) * pow(min(core, 4.0) * 0.25, 3.0) * 0.6;
  col = 1.0 - exp(-col * uIntensity * 1.3);
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

export function PlasmaWave({
  colorA = "#38bdf8",
  colorB = "#a855f7",
  speed = 1,
  amplitude = 1,
  thickness = 1,
  filaments = 6,
  intensity = 1,
  className,
}: PlasmaWaveProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colorA, colorB, speed, amplitude, thickness, filaments, intensity });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colorA, colorB, speed, amplitude, thickness, filaments, intensity };
    redraw.current?.();
  }, [colorA, colorB, speed, amplitude, thickness, filaments, intensity]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uA"), rgb(o.colorA));
        gl.uniform3fv(u("uB"), rgb(o.colorB));
        gl.uniform1f(u("uAmp"), o.amplitude);
        gl.uniform1f(u("uThick"), Math.max(0.1, o.thickness));
        gl.uniform1f(u("uCount"), Math.round(o.filaments));
        gl.uniform1f(u("uIntensity"), o.intensity);
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
