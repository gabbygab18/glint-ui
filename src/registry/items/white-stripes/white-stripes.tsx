"use client";

import { useEffect, useRef } from "react";

export interface WhiteStripesProps {
  /** Stripe color. */
  color?: string;
  /** Drift speed multiplier; 0 freezes the stripes. */
  speed?: number;
  /** Stripe density; higher means thinner, more stripes. */
  scale?: number;
  /** Stripe angle in degrees. */
  angle?: number;
  /** Overall opacity, 0 to 1. */
  opacity?: number;
  /** Layers shift with the cursor for a parallax effect. */
  parallax?: boolean;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uScale;
uniform float uAngle;
uniform float uOpacity;
uniform vec2 uMouse;

// Coverage of one stripe layer at across-coordinate s (in periods), with soft edge width aa.
float cover(float s, float w, float aa) {
  float f = fract(s);
  return smoothstep(0.0, aa, f) * smoothstep(w, w - aa, f);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float px = 1.0 / uRes.y;
  float c = cos(uAngle), s = sin(uAngle);
  vec2 q = mat2(c, -s, s, c) * p;
  float t = uTime;
  vec2 m = uMouse - 0.5;

  vec4 acc = vec4(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    // Back layers are thinner, dimmer and slower: that difference sells the depth.
    float freq = uScale * (7.5 - fi * 2.3);
    float w = 0.2 + fi * 0.06;
    float bright = 0.32 + fi * 0.32;
    float alpha = 0.55 + fi * 0.2;
    float x = q.x + dot(m, vec2(c, -s)) * 0.04 * (fi + 1.0);
    x += 0.035 * (fi * 0.5 + 0.5) * sin(q.y * (1.3 - fi * 0.2) + t * 0.25 + fi * 2.0);
    float sp = x * freq - t * (0.05 + fi * 0.045) + fi * 0.37;

    // Soft drop shadow cast onto everything behind this layer.
    float sh = cover(sp - 0.06, w, 0.12) * 0.45;
    acc = acc * (1.0 - sh) + vec4(0.0, 0.0, 0.0, sh);

    float aa = px * freq * 1.5;
    float cov = cover(sp, w, aa);
    float k = clamp(fract(sp) / w, 0.0, 1.0);
    // Rounded satin profile lit from one side, plus a thin specular line.
    float shade = 0.25 + 0.75 * pow(sin(k * 3.14159), 0.6) * (0.7 + 0.3 * (1.0 - k));
    shade += 0.35 * exp(-pow((k - 0.28) / 0.07, 2.0));
    float a = cov * alpha;
    acc = acc * (1.0 - a) + vec4(uColor * shade * bright * a, a);
  }

  vec2 v = uv - 0.5;
  acc *= uOpacity * clamp(1.0 - dot(v, v) * 1.2, 0.0, 1.0);
  gl_FragColor = acc;
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

export function WhiteStripes({
  color = "#ffffff",
  speed = 1,
  scale = 1,
  angle = 35,
  opacity = 0.85,
  parallax = true,
  className,
}: WhiteStripesProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, scale, angle, opacity, parallax });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, speed, scale, angle, opacity, parallax };
    redraw.current?.();
  }, [color, speed, scale, angle, opacity, parallax]);

  useEffect(() => {
    const el = host.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    const u = gl && fullscreen(gl, FRAG);
    if (!gl || !u) {
      canvas.remove();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0;
    let visible = true;
    let time = 5;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.1));
      gl.uniform1f(u("uAngle"), (o.angle * Math.PI) / 180);
      gl.uniform1f(u("uOpacity"), Math.min(Math.max(o.opacity, 0), 1));
      gl.uniform2f(u("uMouse"), o.parallax ? pointer.x : 0.5, o.parallax ? pointer.y : 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
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
    };

    const target = el.parentElement ?? el;
    target.addEventListener("pointermove", onMove, { passive: true });
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
