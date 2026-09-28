"use client";

import { useEffect, useRef } from "react";

export interface FaultyTerminalProps {
  /** Phosphor color. */
  color?: string;
  /** Character cell height in px. */
  scale?: number;
  /** Scroll and scramble speed multiplier; 0 freezes the text. */
  speed?: number;
  /** Glitch tearing and color fringing (0 to 1). */
  glitch?: number;
  /** Brightness flicker (0 to 1). */
  flicker?: number;
  /** Tube curvature (0 is flat). */
  curvature?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uClock;
uniform float uDpr;
uniform vec2 uMouse;
uniform float uActive;
uniform vec3 uColor;
uniform float uScale;
uniform float uGlitch;
uniform float uFlicker;
uniform float uCurve;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float seg(float seed, float k) { return step(0.63, hash(vec2(seed, k * 1.37 + 0.5))); }

// A pseudo-character on a 5x7 pixel grid, assembled from random strokes.
float glyph(vec2 g, float seed) {
  float lx = step(g.x, 0.5), rx = step(3.5, g.x), cx = step(abs(g.x - 2.0), 0.5);
  float up = step(3.0, g.y), lo = step(g.y, 3.0);
  float on = seg(seed, 0.0) * step(5.5, g.y);
  on = max(on, seg(seed, 1.0) * step(abs(g.y - 3.0), 0.5) * step(0.5, g.x) * step(g.x, 3.5 + rx));
  on = max(on, seg(seed, 2.0) * step(g.y, 0.5));
  on = max(on, seg(seed, 3.0) * lx * up);
  on = max(on, seg(seed, 4.0) * lx * lo);
  on = max(on, seg(seed, 5.0) * rx * up);
  on = max(on, seg(seed, 6.0) * rx * lo);
  on = max(on, seg(seed, 7.0) * cx * up * 0.9);
  on = max(on, seg(seed, 8.0) * cx * lo * 0.9);
  on = max(on, seg(seed, 9.0) * step(abs(6.0 - g.y - g.x * 1.5), 0.6));
  on = max(on, seg(seed, 10.0) * step(abs(g.y - g.x * 1.5), 0.6));
  return on;
}

// x: lit phosphor at this pixel, y: soft glow of the character cell.
vec2 textAt(vec2 frag) {
  float pu = max(floor(uScale * uDpr / 9.0), 1.0);
  vec2 cs = vec2(6.0, 9.0) * pu;
  vec2 top = vec2(frag.x, uRes.y - frag.y);
  vec2 cell = floor(top / cs);
  vec2 local = top - cell * cs;
  vec2 g = floor(local / pu);
  g.y = 7.0 - g.y;
  float inBox = step(g.x, 4.5) * step(0.0, g.y) * step(g.y, 6.5);

  // The log scrolls up one line at a time.
  float line = cell.y + floor(uTime * 1.3);
  float lh = hash(vec2(line, 17.0));
  float cols = floor(uRes.x / cs.x);
  float len = floor(cols * mix(0.12, 0.92, lh * lh));
  float indent = step(0.6, hash(vec2(line, 5.0))) * 2.0;
  float inLine = step(indent, cell.x) * step(cell.x, len) * step(0.12, lh);
  float space = step(hash(vec2(cell.x, line) + 0.37), 0.17);

  // A few cells keep scrambling.
  float fast = step(0.965, hash(cell + vec2(9.1, 2.3)));
  float seed = hash(vec2(cell.x, line) + floor(uTime * 14.0) * fast * 0.13);
  float bright = 0.5 + 0.5 * hash(vec2(line, 41.0));
  float lit = glyph(g, seed * 97.0) * inBox * inLine * (1.0 - space);

  vec2 sub = fract(local / pu) - 0.5;
  float px = smoothstep(0.62, 0.32, max(abs(sub.x), abs(sub.y)));
  return vec2(lit * px, inLine * (1.0 - space) * 0.07) * bright;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 cc = uv * 2.0 - 1.0;
  cc *= 1.0 + uCurve * vec2(0.06, 0.09) * dot(cc, cc);
  vec2 q = abs(cc) - 0.97;
  float box = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.03;
  float inside = 1.0 - smoothstep(-0.004, 0.004, box);
  vec2 frag = (cc * 0.5 + 0.5) * uRes;

  // Glitch: bursts of torn horizontal bands.
  float band = floor(frag.y / (uRes.y / 28.0));
  float gt = floor(uClock * 12.0);
  float burst = step(1.0 - uGlitch * 0.35, hash(vec2(floor(uClock * 1.7), 7.0)));
  float tear = step(1.0 - uGlitch * 0.25, hash(vec2(band, gt))) * burst;
  frag.x += (hash(vec2(band, gt + 1.0)) - 0.5) * uRes.x * 0.08 * tear;

  float ca = (0.3 + uGlitch * 0.8 + tear * 5.0) * uDpr;
  vec2 tr = textAt(frag + vec2(ca, 0.0));
  vec2 tg = textAt(frag);
  vec2 tb = textAt(frag - vec2(ca, 0.0));

  vec3 col = uColor * (tg.x + tg.y);
  col += vec3(1.0, 0.2, 0.35) * max(tr.x - tg.x, 0.0) * 0.55;
  col += vec3(0.25, 0.45, 1.0) * max(tb.x - tg.x, 0.0) * 0.55;
  col += uColor * 0.035;

  float md = length((uMouse - uv) * vec2(uRes.x / uRes.y, 1.0));
  col *= 1.0 + uActive * 0.9 * exp(-md * md * 18.0);

  col *= 0.8 + 0.2 * cos(frag.y / uDpr * 2.0944);
  float roll = fract(uv.y * 0.7 - uClock * 0.07);
  float rb = (roll - 0.5) / 0.05;
  col *= 1.0 + 0.12 * exp(-rb * rb);
  col *= 1.0 - uFlicker * (0.08 * hash(vec2(floor(uClock * 30.0), 1.0)) + 0.03 * sin(uClock * 95.0));
  col += (hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5) * 0.04;
  col *= 1.15 - 0.55 * dot(cc * 0.75, cc * 0.75);

  gl_FragColor = vec4(max(col, 0.0) * inside, 1.0);
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

export function FaultyTerminal({
  color = "#33ff88",
  scale = 18,
  speed = 1,
  glitch = 0.5,
  flicker = 0.5,
  curvature = 0.4,
  className,
}: FaultyTerminalProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, scale, speed, glitch, flicker, curvature });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, scale, speed, glitch, flicker, curvature };
    redraw.current?.();
  }, [color, scale, speed, glitch, flicker, curvature]);

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
    let time = 0;
    let clock = 0;
    let last = 0;
    let dpr = 1;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform1f(u("uClock"), clock);
      gl.uniform1f(u("uDpr"), dpr);
      gl.uniform2f(u("uMouse"), pointer.x, pointer.y);
      gl.uniform1f(u("uActive"), pointer.active);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 6));
      gl.uniform1f(u("uGlitch"), reduced ? 0 : Math.min(Math.max(o.glitch, 0), 1));
      gl.uniform1f(u("uFlicker"), Math.min(Math.max(o.flicker, 0), 1));
      gl.uniform1f(u("uCurve"), Math.max(o.curvature, 0));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      time += dt * opts.current.speed;
      clock += dt;
      pointer.x += (pointer.tx - pointer.x) * 0.15;
      pointer.y += (pointer.ty - pointer.y) * 0.15;
      pointer.active += (pointer.ta - pointer.active) * 0.06;
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
