"use client";

import { useEffect, useRef } from "react";

export interface AuroraDotsProps {
  /** Three aurora colors the dots pick up. */
  colors?: string[];
  /** Color of unlit dots. */
  baseColor?: string;
  /** Px between dots. */
  gap?: number;
  /** Dot radius in px at full light. */
  dotSize?: number;
  /** Drift speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Size of the aurora bands; higher means broader. */
  scale?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uGap;
uniform float uSize;
uniform float uScale;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uBase;

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
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + vec2(11.7, 5.3); a *= 0.5; }
  return v;
}
vec3 palette(float h) {
  h = clamp(h, 0.0, 1.0);
  return h < 0.5 ? mix(uC1, uC2, h * 2.0) : mix(uC2, uC3, h * 2.0 - 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 cell = floor(fc / uGap);
  vec2 center = (cell + 0.5) * uGap;
  // The light field is sampled once per dot, so each dot glows in a single flat color.
  vec2 p = center / uRes.y * 1.6 / uScale;
  float t = uTime * 0.06;
  vec2 q = vec2(fbm(p + vec2(t, -t * 0.5)), fbm(p + vec2(3.1, 1.7) - t * 0.7));
  float f = fbm(p * 0.9 + q * 1.6 + vec2(t * 0.4, 0.0));
  float ribbon = pow(1.0 - abs(sin((p.y + q.x * 1.4 - p.x * 0.3) * 2.2 + t * 2.0)), 4.0);
  float light = ribbon * 0.75 * smoothstep(0.25, 0.6, f) + smoothstep(0.5, 0.8, f) * 0.7;
  float hover = exp(-dot(center - uMouse, center - uMouse) / (uGap * uGap * 60.0)) * uHover;
  light = clamp(light + hover * 0.7, 0.0, 1.0);
  float hue = q.y * 1.6 - 0.3 + p.x * 0.12;

  float d = length(fc - center);
  float r = uSize * (0.45 + 0.55 * light);
  float mask = 1.0 - smoothstep(r - 0.8, r + 0.8, d);
  vec3 col = mix(uBase, palette(hue), smoothstep(0.02, 0.6, light));
  float a = mask * (0.35 + 0.65 * light);
  gl_FragColor = vec4(col * a, a);
}
`;

function rgb(hex: string) {
  let h = (hex || "#000").replace("#", "");
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

export function AuroraDots({
  colors = ["#34d399", "#22d3ee", "#a78bfa"],
  baseColor = "#3f3f46",
  gap = 18,
  dotSize = 2.5,
  speed = 1,
  scale = 1,
  className,
}: AuroraDotsProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, baseColor, gap, dotSize, speed, scale });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, baseColor, gap, dotSize, speed, scale };
    redraw.current?.();
  }, [colors, baseColor, gap, dotSize, speed, scale]);

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
    // Pointer in CSS px from the bottom-left; `a` fades the hover glow in and out.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0 };
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let time = 25;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      const c = o.colors.length ? o.colors : ["#ffffff"];
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uMouse"), pointer.x * dpr, pointer.y * dpr);
      gl.uniform1f(u("uHover"), pointer.a);
      gl.uniform1f(u("uGap"), Math.max(o.gap, 4) * dpr);
      gl.uniform1f(u("uSize"), Math.max(o.dotSize, 0.5) * dpr);
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.uniform3fv(u("uC1"), rgb(c[0]));
      gl.uniform3fv(u("uC2"), rgb(c[1 % c.length]));
      gl.uniform3fv(u("uC3"), rgb(c[2 % c.length]));
      gl.uniform3fv(u("uBase"), rgb(o.baseColor));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.1;
      pointer.y += (pointer.ty - pointer.y) * 0.1;
      pointer.a += (pointer.ta - pointer.a) * 0.06;
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
      pointer.tx = e.clientX - r.left;
      pointer.ty = r.height - (e.clientY - r.top);
      if (pointer.a < 0.01) {
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
