"use client";

import { useEffect, useRef } from "react";

export interface GhostFibersProps {
  /** One color per bundle (up to three). */
  colors?: string[];
  /** Fibers per bundle. */
  fibers?: number;
  /** Halo strength around each fiber. */
  glow?: number;
  /** How far fibers drift apart from each other. */
  spread?: number;
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
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uFibers;
uniform float uGlow;
uniform float uSpread;

float hash(float n) { return fract(sin(n * 91.345) * 47453.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0;
  return mix(mix(hash(n), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
}

void main() {
  float asp = uRes.x / uRes.y;
  float px = 1.0 / uRes.y;
  mat2 tilt = mat2(0.974, 0.225, -0.225, 0.974);
  vec2 p = tilt * (gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5));
  vec2 m = tilt * ((uMouse - 0.5) * vec2(asp, 1.0));
  float t = uTime;
  vec3 col = vec3(0.0);

  for (int b = 0; b < 3; b++) {
    float fb = float(b);
    vec3 bc = b == 0 ? uC0 : (b == 1 ? uC1 : uC2);
    float x = p.x;
    float s1 = x * 1.3 + t * 0.35 + fb * 2.1;
    float s2 = x * 2.9 - t * 0.27 + fb * 4.0;
    float path = (fb - 1.0) * 0.2 * uSpread + 0.14 * sin(s1) + 0.06 * sin(s2);
    float dpath = 0.182 * cos(s1) + 0.174 * cos(s2);
    vec2 dm = vec2(x, path) - m;
    path += dm.y / (abs(dm.y) + 0.05) * 0.09 * uHover * exp(-dot(dm, dm) / 0.05);
    // bundle radius swells and pinches along its length: fibers braid together then drift apart
    float rad = (0.02 + 0.07 * (0.5 + 0.5 * sin(x * 0.9 - t * 0.4 + fb * 1.7))) * uSpread;
    float fk = 2.2 + 0.2 * fb;
    for (int i = 0; i < 24; i++) {
      float fi = float(i);
      if (fi >= uFibers) break;
      float ph = x * fk + t * (0.5 + 0.1 * fb) + fi * 6.2831853 / uFibers + hash(fi + fb * 7.0) * 1.3;
      float amp = rad * (0.6 + 0.4 * hash(fi * 3.7 + fb));
      float y = path + amp * sin(ph);
      float dy = dpath + amp * fk * cos(ph);
      float z = 0.5 + 0.5 * cos(ph);  // 1 = in front
      float d = abs(p.y - y) / sqrt(1.0 + dy * dy);
      float w = px * (0.7 + 0.9 * z);
      float life = smoothstep(0.25, 0.75, noise(vec2(x * 0.8 - t * 0.2, fi * 3.1 + fb * 11.0)));
      float I = exp(-d * d / (w * w)) * 0.8 + uGlow * 0.1 * exp(-d / (px * 20.0));
      col += mix(bc, vec3(1.0), 0.25 * z) * I * life * (0.3 + 0.7 * z);
    }
  }

  // faint haze that follows the cursor
  col += (uC0 + uC1) * 0.06 * uHover * exp(-dot(p - m, p - m) * 6.0);
  col += mix(uC1, uC0, gl_FragCoord.x / uRes.x) * 0.035 * exp(-p.y * p.y * 8.0);
  float ex = gl_FragCoord.x / uRes.x;
  col *= smoothstep(0.0, 0.15, ex) * smoothstep(1.0, 0.85, ex);
  col = 1.0 - exp(-col * 1.2);
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

export function GhostFibers({
  colors = ["#8be9fd", "#b69cff", "#ff9ad5"],
  fibers = 9,
  glow = 1,
  spread = 1,
  speed = 1,
  className,
}: GhostFibersProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, fibers, glow, spread, speed });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colors, fibers, glow, spread, speed };
    redraw.current?.();
  }, [colors, fibers, glow, spread, speed]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const c = o.colors.length ? o.colors : ["#ffffff"];
        for (let i = 0; i < 3; i++) gl.uniform3fv(u(`uC${i}`), rgb(c[i % c.length]));
        gl.uniform1f(u("uFibers"), Math.max(1, o.fibers));
        gl.uniform1f(u("uGlow"), o.glow);
        gl.uniform1f(u("uSpread"), o.spread);
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
