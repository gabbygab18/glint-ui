"use client";

import { useEffect, useRef } from "react";

export interface DitherProps {
  /** Ink color of the lit dots. */
  color?: string;
  /** Background color between the dots. */
  background?: string;
  /** Size of one dither pixel in px. */
  pixelSize?: number;
  /** Wave speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Zoom; higher means broader waves. */
  scale?: number;
  /** Cursor sends ripples through the waves. */
  interactive?: boolean;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uActive;
uniform vec3 uInk;
uniform vec3 uBg;
uniform float uPixel;
uniform float uScale;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

// Ordered (Bayer) threshold, built recursively from the 2x2 matrix.
float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uPixel);
  vec2 c = (cell + 0.5) * uPixel;
  vec2 p = (c - 0.5 * uRes) / uRes.y * 3.0 / uScale;
  float t = uTime * 0.5;

  float n = fbm(p * 0.55 + vec2(t * 0.12, -t * 0.08));
  float v = 0.5 + 0.5 * sin(p.y * 2.6 + p.x * 0.6 + n * 3.2 - t * 1.3);
  v = pow(v, 1.8) * (0.35 + 0.75 * n);

  vec2 m = (uMouse - 0.5) * uRes / uRes.y * 3.0 / uScale;
  float d = length(p - m);
  v += uActive * exp(-d * d * 0.9) * (0.3 + 0.3 * sin(d * 9.0 - t * 9.0));

  vec2 uv = c / uRes - 0.5;
  v *= 1.05 - dot(uv, uv) * 1.3;

  float on = step(bayer8(cell) + 0.01, clamp(v, 0.0, 1.0));
  gl_FragColor = vec4(mix(uBg, uInk, on), 1.0);
}
`;

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Compiles a full-screen-triangle program and returns a cached uniform lookup, or null. */
function fullscreen(gl: WebGLRenderingContext, frag: string) {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const cache = new Map<string, WebGLUniformLocation | null>();
  return (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name));
    return cache.get(name) ?? null;
  };
}

export function Dither({
  color = "#c6ff3d",
  background = "#0a0a0c",
  pixelSize = 3,
  speed = 1,
  scale = 1,
  interactive = true,
  className,
}: DitherProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, background, pixelSize, speed, scale, interactive });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, background, pixelSize, speed, scale, interactive };
    redraw.current?.();
  }, [color, background, pixelSize, speed, scale, interactive]);

  useEffect(() => {
    const el = host.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    const u = gl && fullscreen(gl, FRAG);
    if (!gl || !u) {
      canvas.remove();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, active: 0, tx: 0.5, ty: 0.5, ta: 0 };
    let raf = 0;
    let visible = true;
    let time = 5;
    let last = 0;
    let dpr = 1;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uMouse"), pointer.x, pointer.y);
      gl.uniform1f(u("uActive"), o.interactive ? pointer.active : 0);
      gl.uniform3fv(u("uInk"), rgb(o.color));
      gl.uniform3fv(u("uBg"), rgb(o.background));
      gl.uniform1f(u("uPixel"), Math.max(Math.round(o.pixelSize * dpr), 1));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.1;
      pointer.y += (pointer.ty - pointer.y) * 0.1;
      pointer.active += (pointer.ta - pointer.active) * 0.05;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.tx = (e.clientX - r.left) / r.width;
      pointer.ty = 1 - (e.clientY - r.top) / r.height;
      if (!pointer.ta) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.ta = 1;
    };
    const onLeave = () => {
      pointer.ta = 0;
    };

    const target = el.parentElement ?? el;
    target.addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    redraw.current = draw;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      redraw.current = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    />
  );
}
