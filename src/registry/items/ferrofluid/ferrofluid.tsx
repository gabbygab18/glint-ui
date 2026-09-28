"use client";

import { useEffect, useRef } from "react";

export interface FerrofluidProps {
  /** Rim light and glow color. */
  color?: string;
  /** Number of spikes around the blob. */
  spikes?: number;
  /** Spike length multiplier. */
  spikeLength?: number;
  /** Blob size multiplier. */
  size?: number;
  /** Animation speed multiplier. */
  speed?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uColor;
uniform float uSpikes;
uniform float uSpike;
uniform float uSize;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Signed field of the fluid (negative inside). mag = where the magnet pulls.
float field(vec2 p, vec2 mag) {
  float t = uTime;
  float R = 0.23 * uSize;
  vec2 c = mag * 0.07;
  float d = length(p - c) - R * (1.0 + 0.03 * sin(t * 1.7));
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 o = c + R * (1.0 + 0.25 * sin(t * 0.7 + fi)) *
      vec2(cos(t * (0.45 + 0.1 * fi) + fi * 2.1), sin(t * (0.38 + 0.12 * fi) + fi * 1.3));
    d = smin(d, length(p - o) - R * (0.42 - 0.07 * fi), 0.14 * uSize);
  }
  vec2 q = p - c;
  float r = length(q);
  vec2 dir = q / max(r, 1e-4);
  vec2 tm = mag - c;
  float near = smoothstep(1.3, 0.15, length(tm));
  float pull = smoothstep(-0.15, 1.0, dot(dir, normalize(tm + 1e-5)));
  pull = mix(0.3, pull * pull, smoothstep(0.05, 0.45, length(tm))) * (0.35 + 0.65 * near);
  float n = floor(uSpikes);
  float cell = atan(q.y, q.x) / 6.2831853 * n;
  float id = mod(floor(cell), n) / n * 6.2831853;
  float f = fract(cell) - 0.5;
  float jit = 0.8 + 0.2 * sin(id * 5.0 + t * 2.3) * sin(id * 3.0 - t * 1.1);
  float cone = pow(max(0.0, 1.0 - abs(f) * 2.3), 1.8);
  float len = uSpike * R * (0.1 + 0.95 * pull) * jit;
  return d - len * cone * smoothstep(R * 0.7, R * 1.05, r) * smoothstep(R * 3.4, R * 1.6, r);
}

float height(float d) {
  float x = clamp(-d / (0.16 * uSize), 0.0, 1.0);
  return x * (2.0 - x);
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  vec2 mouse = (uMouse - 0.5) * vec2(asp, 1.0);
  float t = uTime;
  vec2 mag = mix(vec2(cos(t * 0.31), sin(t * 0.43)) * 0.5, mouse, uHover);

  float e = 1.0 / uRes.y;
  float d = field(p, mag);
  float h = height(d);
  float hx = height(field(p + vec2(e, 0.0), mag));
  float hy = height(field(p + vec2(0.0, e), mag));
  vec3 n = normalize(vec3((h - hx) / e * 0.1, (h - hy) / e * 0.1, 1.0));

  // Glossy black: all color comes from reflected studio lights.
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  float box = smoothstep(0.1, 0.7, r.y) * smoothstep(0.9, 0.2, abs(r.x));
  float key = pow(max(dot(r, normalize(vec3(-0.55, 0.6, 0.6))), 0.0), 48.0);
  float fill = pow(max(dot(r, normalize(vec3(0.7, -0.35, 0.6))), 0.0), 6.0);
  float cur = pow(max(dot(r, normalize(vec3(mag - p, 0.3))), 0.0), 70.0) * uHover;
  float fres = pow(1.0 - n.z, 2.5);
  vec3 fluid = vec3(0.008, 0.008, 0.012);
  fluid += vec3(0.9, 0.93, 1.0) * (box * fres * 0.55 + key * 1.6 + cur * 0.9);
  fluid += uColor * (fill * 0.55 + fres * 0.25);
  fluid += vec3(1.0) * pow(max(dot(r, normalize(vec3(-0.2, 0.3, 0.93))), 0.0), 400.0) * 0.6;

  vec3 bg = vec3(0.014, 0.014, 0.02) + uColor * 0.09 * exp(-length(p) * 2.0);
  bg += uColor * 0.4 * exp(-max(d, 0.0) * 10.0);
  vec3 col = mix(bg, fluid, smoothstep(e, -e, d));
  col *= 1.0 - 0.35 * dot(p, p);
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

export function Ferrofluid({
  color = "#7c6cff",
  spikes = 28,
  spikeLength = 1,
  size = 1,
  speed = 1,
  className,
}: FerrofluidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, spikes, spikeLength, size, speed });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { color, spikes, spikeLength, size, speed };
    redraw.current?.();
  }, [color, spikes, spikeLength, size, speed]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uColor"), rgb(o.color));
        gl.uniform1f(u("uSpikes"), Math.max(3, o.spikes));
        gl.uniform1f(u("uSpike"), o.spikeLength);
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
