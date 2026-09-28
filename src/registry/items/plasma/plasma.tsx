"use client";

import { useEffect, useRef } from "react";

export interface PlasmaProps {
  /** First palette color. */
  colorA?: string;
  /** Second palette color. */
  colorB?: string;
  /** Third palette color. */
  colorC?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Pattern zoom; higher means smaller blobs. */
  scale?: number;
  /** How strongly the cursor twists the plasma. */
  mouseStrength?: number;
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
uniform vec3 uC;
uniform float uScale;
uniform float uWarp;

// cyclic three-stop gradient
vec3 pal(float x) {
  x = fract(x) * 3.0;
  vec3 c = mix(uA, uB, smoothstep(0.0, 1.0, x));
  c = mix(c, uC, smoothstep(1.0, 2.0, x));
  return mix(c, uA, smoothstep(2.0, 3.0, x));
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes.y;
  float z = 3.0 * uScale;
  vec2 p = (uv - vec2(0.5 * asp, 0.5)) * z;
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0) * z;
  float t = uTime * 0.45;

  // cursor: a soft whirlpool plus rings
  vec2 dm = p - m;
  float dd = length(dm);
  float fall = exp(-dd * dd * 1.2 / (uScale * uScale)) * uHover * uWarp;
  float a = fall * 2.2;
  p = m + mat2(cos(a), -sin(a), sin(a), cos(a)) * dm;

  float v = sin(p.x * 1.2 + t);
  v += sin(p.y * 1.5 - t * 1.3);
  v += sin((p.x + p.y) * 0.9 + t * 0.7);
  v += sin(length(p + vec2(sin(t * 0.33), cos(t * 0.41)) * 1.8) * 2.2 - t * 1.1);
  v += sin(length(p - vec2(cos(t * 0.27), sin(t * 0.37)) * 2.0) * 1.7 + t);
  v += sin(dd * 7.0 - uTime * 3.0) * fall * 0.8;
  v /= 5.0;

  vec3 col = pal(v * 0.75 + 0.5 + t * 0.04);
  // gentle ridges give the plasma a glossy, layered depth
  float ridge = 0.5 + 0.5 * sin(v * 7.0 + t * 0.8);
  col *= 0.78 + 0.32 * ridge;
  col += pow(ridge, 16.0) * 0.12;
  vec2 q = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(q, q) * 0.7;
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

export function Plasma({
  colorA = "#6d28d9",
  colorB = "#ec4899",
  colorC = "#06b6d4",
  speed = 1,
  scale = 1,
  mouseStrength = 1,
  className,
}: PlasmaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ colorA, colorB, colorC, speed, scale, mouseStrength });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { colorA, colorB, colorC, speed, scale, mouseStrength };
    redraw.current?.();
  }, [colorA, colorB, colorC, speed, scale, mouseStrength]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uA"), rgb(o.colorA));
        gl.uniform3fv(u("uB"), rgb(o.colorB));
        gl.uniform3fv(u("uC"), rgb(o.colorC));
        gl.uniform1f(u("uScale"), Math.max(0.1, o.scale));
        gl.uniform1f(u("uWarp"), o.mouseStrength);
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
