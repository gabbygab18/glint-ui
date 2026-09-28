"use client";

import { useEffect, useRef } from "react";

export interface TopographyProps {
  /** Color of the low contour lines. */
  color?: string;
  /** Color of the peaks; lines blend toward it with height. */
  peakColor?: string;
  /** Number of contour levels; higher means denser lines. */
  levels?: number;
  /** Line width in px. */
  lineWidth?: number;
  /** Drift speed multiplier; 0 freezes the terrain. */
  speed?: number;
  /** Terrain zoom; higher means larger hills. */
  scale?: number;
  /** Height of the hill that rises under the cursor, 0 to disable. */
  cursorHill?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHill;
uniform vec3 uColor;
uniform vec3 uPeak;
uniform float uLevels;
uniform float uWidth;
uniform float uScale;

float hash(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 2.2 / uScale;
  vec2 m = (uMouse - 0.5) * uRes / uRes.y * 2.2 / uScale;
  float t = uTime * 0.035;

  // Slowly warped terrain, plus a soft hill that follows the cursor.
  vec2 w = vec2(fbm(p * 0.35 + vec2(t, -t * 0.7)), fbm(p * 0.35 + vec2(4.1 - t * 0.8, 1.7 + t)));
  float hgt = fbm(p * 0.55 + w * 0.8 + vec2(t * 0.5, 0.0));
  vec2 dm = p - m;
  hgt += uHill * 0.28 * exp(-dot(dm, dm) * 2.2 * uScale * uScale);

  float v = hgt * uLevels;
  float fw = max(fwidth(v), 1e-4);
  float e = abs(fract(v + 0.5) - 0.5) / fw;
  float idx = floor(v + 0.5);
  float major = 1.0 - step(0.5, mod(idx, 5.0));
  float lw = uWidth * (1.0 + major * 0.8);
  float line = 1.0 - smoothstep(lw * 0.5 - 0.5, lw * 0.5 + 0.75, e);

  float k = smoothstep(0.3, 0.68, hgt);
  vec3 col = mix(uColor, uPeak, k);
  float a = line * (0.5 + 0.4 * major + 0.2 * k);
  // Faint elevation wash between the lines.
  a += 0.05 * k * k;
  vec2 q = uv - 0.5;
  a *= clamp(1.25 - dot(q, q) * 2.2, 0.0, 1.0);
  a = clamp(a, 0.0, 1.0);
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

export function Topography({
  color = "#38bdf8",
  peakColor = "#c6ff3d",
  levels = 22,
  lineWidth = 1,
  speed = 1,
  scale = 1,
  cursorHill = 1,
  className,
}: TopographyProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, peakColor, levels, lineWidth, speed, scale, cursorHill });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, peakColor, levels, lineWidth, speed, scale, cursorHill };
    redraw.current?.();
  }, [color, peakColor, levels, lineWidth, speed, scale, cursorHill]);

  useEffect(() => {
    const el = host.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    const u = gl && gl.getExtension("OES_standard_derivatives") && fullscreen(gl, FRAG);
    if (!gl || !u) {
      canvas.remove();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // `a` eases the cursor hill in and out as the pointer enters and leaves.
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, a: 0, ta: 0 };
    let raf = 0;
    let visible = true;
    let time = 30;
    let last = 0;
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uMouse"), pointer.x, pointer.y);
      gl.uniform1f(u("uHill"), o.cursorHill * pointer.a);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform3fv(u("uPeak"), rgb(o.peakColor));
      gl.uniform1f(u("uLevels"), Math.max(o.levels, 1));
      gl.uniform1f(u("uWidth"), Math.max(o.lineWidth, 0.25) * dpr());
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      pointer.a += (pointer.ta - pointer.a) * 0.03;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr()));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr()));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.tx = (e.clientX - r.left) / r.width;
      pointer.ty = 1 - (e.clientY - r.top) / r.height;
      if (pointer.ta === 0 && pointer.a < 0.01) {
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
