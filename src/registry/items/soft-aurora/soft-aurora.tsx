"use client";

import { useEffect, useRef } from "react";

export interface SoftAuroraProps {
  /** Three curtain colors, back to front. Pastels work best. */
  colors?: string[];
  /** Drift speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Width of the folds; higher means broader, lazier curtains. */
  scale?: number;
  /** Overall brightness. */
  intensity?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uScale;
uniform float uIntensity;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.3); a *= 0.5; }
  return v;
}

vec3 palette(float h) {
  h = clamp(h, 0.0, 1.0);
  return h < 0.5 ? mix(uC1, uC2, h * 2.0) : mix(uC2, uC3, h * 2.0 - 1.0);
}

// One curtain: a wavy lower hem with an upward fade, streaked by soft vertical rays.
// Color follows height (first color at the hem, later colors toward the top) and drifts sideways,
// so overlapping curtains never mix into gray.
vec3 curtain(vec2 p, float t, float seed, float hemY) {
  float sway = fbm(vec2(p.x * 0.35 + seed, t * 0.5)) * 2.0 - 1.0;
  float x = p.x + sway * 0.9;
  float hem = hemY + 0.13 * sin(x * 1.3 + t * 1.3 + seed) + 0.2 * (fbm(vec2(x * 0.9, t * 0.8 + seed)) - 0.5);
  float d = p.y - hem;
  float up = max(d, 0.0);
  float body = smoothstep(-0.03, 0.05, d) * (exp(-up * 5.0) * 0.9 + exp(-up * 1.6) * 0.15);
  float under = exp(-max(-d, 0.0) * 16.0) * 0.12;
  float rays = noise(vec2(x * 4.0 + seed * 7.0, t * 1.1 + p.y * 0.1));
  rays = 0.12 + 0.88 * smoothstep(0.2, 0.95, rays);
  float gap = smoothstep(0.36, 0.68, fbm(vec2(x * 0.5 - t * 0.6, seed)));
  float hue = smoothstep(0.2, 0.8, fbm(vec2(x * 0.25 + t * 0.4, seed + 2.0))) * 0.55 + up * 1.1;
  return palette(hue) * (body * rays + under) * gap;
}

void main() {
  vec2 p = vec2((gl_FragCoord.x - 0.5 * uRes.x) / uRes.y / uScale, gl_FragCoord.y / uRes.y);
  float t = uTime * 0.08;
  vec3 col = curtain(p, t, 0.0, 0.42);
  col += curtain(p * vec2(1.4, 1.0), t * 1.15, 3.7, 0.3) * 0.8;
  col = 1.0 - exp(-col * 1.4 * uIntensity);
  // Premultiplied alpha so the glow sits on any background.
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
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

export function SoftAurora({
  colors = ["#6ee7b7", "#a78bfa", "#f9a8d4"],
  speed = 1,
  scale = 1,
  intensity = 1,
  className,
}: SoftAuroraProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, speed, scale, intensity });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, speed, scale, intensity };
    redraw.current?.();
  }, [colors, speed, scale, intensity]);

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
    let raf = 0;
    let visible = true;
    let time = 40;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      const c = o.colors.length ? o.colors : ["#ffffff"];
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uC1"), rgb(c[0]));
      gl.uniform3fv(u("uC2"), rgb(c[1 % c.length]));
      gl.uniform3fv(u("uC3"), rgb(c[2 % c.length]));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.uniform1f(u("uIntensity"), o.intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

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
