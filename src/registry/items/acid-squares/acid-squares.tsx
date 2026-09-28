"use client";

import { useEffect, useRef } from "react";

export interface AcidSquaresProps {
  /** Up to four neon colors the squares cycle through. */
  colors?: string[];
  /** Square size in px, including the gap. */
  cellSize?: number;
  /** Gap between squares in px. */
  gap?: number;
  /** Wave speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Px radius the cursor lights up. */
  cursorRadius?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uActive;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uCell;
uniform float uGap;
uniform float uRadius;
uniform float uDpr;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Smooth cyclic blend through the four colors.
vec3 palette(float t) {
  t = fract(t) * 4.0;
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0)));
  c = mix(c, uC2, smoothstep(0.0, 1.0, clamp(t - 1.0, 0.0, 1.0)));
  c = mix(c, uC3, smoothstep(0.0, 1.0, clamp(t - 2.0, 0.0, 1.0)));
  return mix(c, uC0, smoothstep(0.0, 1.0, clamp(t - 3.0, 0.0, 1.0)));
}

void main() {
  float cs = uCell * uDpr;
  vec2 id = floor(gl_FragCoord.xy / cs);
  vec2 center = (id + 0.5) * cs;
  vec2 f = (gl_FragCoord.xy - center) / cs;
  vec2 c = center / uRes.y;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float h = hash(id);

  // Three interfering waves: a diagonal sweep, a ripple and a slow meander.
  float w = sin(c.x * 3.1 + c.y * 1.7 - t * 1.1)
          + 0.8 * sin(length(c - vec2(aspect * 0.3, 0.25)) * 6.0 - t * 1.6)
          + 0.6 * sin(c.y * 4.2 - t * 0.7 + sin(c.x * 2.3 + t * 0.4) * 1.6);

  float crest = 0.5 + 0.5 * sin(w * 1.7 + h * 0.9);
  float b = 0.1 + 0.95 * pow(crest, 4.0);
  b *= 0.85 + 0.15 * sin(t * 2.7 + h * 40.0);

  float md = length(center - uMouse * uRes) / (uRadius * uDpr);
  b += uActive * 1.3 * exp(-md * md * 2.4);

  vec3 col = palette(w * 0.2 + t * 0.05 + h * 0.05);
  col = mix(col, vec3(1.0), clamp(b - 1.0, 0.0, 1.0) * 0.45);

  // Rounded square that swells a little as it brightens.
  float hs = (0.5 - 0.5 * uGap / uCell) * (0.88 + 0.12 * min(b, 1.0));
  float r = hs * 0.22;
  float d = (length(max(abs(f) - hs + r, 0.0)) - r) * cs;
  float mask = 1.0 - smoothstep(-0.75, 0.75, d);
  float glow = exp(-max(d, 0.0) / (cs * 0.16)) * 0.3 * min(b, 1.4);

  float e = clamp(mask * b + (1.0 - mask) * glow, 0.0, 1.0);
  gl_FragColor = vec4(col * e, e);
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

export function AcidSquares({
  colors = ["#c6ff3d", "#00e5ff", "#ff2bd6", "#ffb800"],
  cellSize = 28,
  gap = 4,
  speed = 1,
  cursorRadius = 180,
  className,
}: AcidSquaresProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, cellSize, gap, speed, cursorRadius });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, cellSize, gap, speed, cursorRadius };
    redraw.current?.();
  }, [colors, cellSize, gap, speed, cursorRadius]);

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
    let time = 3;
    let last = 0;
    let dpr = 1;

    const draw = () => {
      const o = opts.current;
      const list = o.colors.length ? o.colors : ["#ffffff"];
      for (let i = 0; i < 4; i++) gl.uniform3fv(u(`uC${i}`), rgb(list[i % list.length]));
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uMouse"), pointer.x, pointer.y);
      gl.uniform1f(u("uActive"), pointer.active);
      gl.uniform1f(u("uCell"), Math.max(o.cellSize, 4));
      gl.uniform1f(u("uGap"), Math.min(Math.max(o.gap, 0), o.cellSize - 2));
      gl.uniform1f(u("uRadius"), Math.max(o.cursorRadius, 1));
      gl.uniform1f(u("uDpr"), dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.2;
      pointer.y += (pointer.ty - pointer.y) * 0.2;
      pointer.active += (pointer.ta - pointer.active) * 0.08;
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
