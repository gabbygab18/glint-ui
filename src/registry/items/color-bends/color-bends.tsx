"use client";

import { useEffect, useRef } from "react";

export interface ColorBendsProps {
  /** Up to four colors the bands flow through. */
  colors?: string[];
  /** Flow speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Zoom; higher means wider bends. */
  scale?: number;
  /** Number of bands across the view. */
  bands?: number;
  /** How strongly the cursor warps the bands (0 disables). */
  warp?: number;
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
uniform float uScale;
uniform float uBands;
uniform float uWarp;

// Ping-pongs through the colors (0 1 2 3 2 1 0) so no muddy wrap-around blend appears.
vec3 palette(float t) {
  t = (1.0 - abs(fract(t * 0.5) * 2.0 - 1.0)) * 3.0;
  vec3 c = mix(uC0, uC1, smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0)));
  c = mix(c, uC2, smoothstep(0.0, 1.0, clamp(t - 1.0, 0.0, 1.0)));
  return mix(c, uC3, smoothstep(0.0, 1.0, clamp(t - 2.0, 0.0, 1.0)));
}

// Band coordinate: a slanted gradient bent by layered, drifting sines.
float field(vec2 p, float t) {
  p.y += 0.42 * sin(p.x * 0.9 + t * 0.6);
  p.x += 0.32 * sin(p.y * 1.4 - t * 0.45);
  p.y += 0.24 * sin(p.x * 2.1 + p.y * 0.7 + t * 0.35);
  p.x += 0.12 * sin(p.y * 3.1 + t * 0.5);
  return p.y * 0.9 + p.x * 0.35;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 2.0 / uScale;
  vec2 m = (uMouse - 0.5) * uRes / uRes.y * 2.0 / uScale;
  vec2 d = p - m;
  p -= d * uWarp * 0.45 * exp(-dot(d, d) * 2.5) * uActive;

  float t = uTime * 0.4;
  float s = field(p, t);
  float e = 0.004;
  vec2 grad = vec2(field(p + vec2(e, 0.0), t) - s, field(p + vec2(0.0, e), t) - s) / e;

  float k = s * uBands;
  float ridge = max(sin(fract(k) * 3.14159), 0.0);
  vec3 col = palette(k * 0.16 + t * 0.04);

  // Each band reads as a soft ribbon lit from above; compressed folds fall into shadow.
  float light = 0.5 + 0.5 * dot(normalize(grad + 1e-4), normalize(vec2(-0.35, 0.94)));
  col *= (0.5 + 0.5 * pow(ridge, 0.7)) * (0.72 + 0.4 * light);
  col += vec3(1.0) * pow(ridge, 26.0) * 0.22 * light;
  col *= mix(1.0, 0.45, smoothstep(1.3, 2.6, length(grad)));

  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(v, v) * 0.8;
  gl_FragColor = vec4(col, 1.0);
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

export function ColorBends({
  colors = ["#ff5e3a", "#ff2d95", "#7a5cff", "#00c2ff"],
  speed = 1,
  scale = 1,
  bands = 3,
  warp = 1,
  className,
}: ColorBendsProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, speed, scale, bands, warp });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, speed, scale, bands, warp };
    redraw.current?.();
  }, [colors, speed, scale, bands, warp]);

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
    let time = 4;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      const list = o.colors.length ? o.colors : ["#ffffff"];
      for (let i = 0; i < 4; i++) gl.uniform3fv(u(`uC${i}`), rgb(list[i % list.length]));
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uMouse"), pointer.x, pointer.y);
      gl.uniform1f(u("uActive"), pointer.active);
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.uniform1f(u("uBands"), Math.max(o.bands, 0.1));
      gl.uniform1f(u("uWarp"), o.warp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      pointer.active += (pointer.ta - pointer.active) * 0.04;
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
