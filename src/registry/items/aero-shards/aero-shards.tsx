"use client";

import { useEffect, useRef } from "react";

export interface AeroShardsProps {
  /** Three glow colors behind the glass. */
  colors?: string[];
  /** Drift speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Shard size multiplier. */
  scale?: number;
  /** Share of grid cells holding a shard (0 to 1). */
  density?: number;
  /** Strength of the refraction through the glass. */
  refraction?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLook;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uScale;
uniform float uDensity;
uniform float uRefract;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// The scene seen through the glass: soft glowing color fields on deep navy.
vec3 backdrop(vec2 p) {
  float t = uTime * 0.12;
  vec3 col = mix(vec3(0.012, 0.018, 0.04), vec3(0.03, 0.04, 0.09), smoothstep(-0.6, 0.8, p.y));
  vec2 a = vec2(sin(t * 1.3) * 0.7, cos(t * 0.9) * 0.3 + 0.25);
  vec2 b = vec2(cos(t * 0.7 + 1.0) * 0.8, sin(t * 1.1) * 0.35 - 0.25);
  vec2 c = vec2(sin(t * 0.5 + 2.0) * 0.5, cos(t * 0.6 + 1.0) * 0.4);
  col += uC0 * 0.6 * exp(-dot(p - a, p - a) * 2.6);
  col += uC1 * 0.55 * exp(-dot(p - b, p - b) * 2.2);
  col += uC2 * 0.42 * exp(-dot(p - c, p - c) * 3.5);
  // Faint flowing light strands give the glass something to bend.
  float w = sin(p.y * 11.0 + sin(p.x * 2.3 + t * 2.0) * 1.6 + p.x * 1.5);
  col += mix(uC0, uC1, 0.5 + 0.5 * sin(p.x * 1.7)) * smoothstep(0.08, 0.0, abs(w)) * 0.08;
  return col;
}

// Signed distance to a triangle (negative inside).
float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 q0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 q1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 q2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(q0, q0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(q1, q1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(q2, q2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float px = 1.0 / uRes.y;
  float t = uTime;
  vec3 col = backdrop(p);

  // Four layers, far to near: nearer shards are larger, faster and shift more with the cursor.
  for (int i = 0; i < 4; i++) {
    float L = float(i);
    float k = L / 3.0;
    float cell = mix(0.42, 0.95, k) * uScale;
    vec2 q = (p + uLook * (0.015 + 0.05 * k)) / cell + vec2(0.02, 0.05 + 0.05 * k) * t / cell + L * 7.31;
    vec2 id = floor(q);
    float h = hash(id + L * 13.1);
    if (h > uDensity) continue;

    vec2 o = (vec2(hash(id + 1.7), hash(id + 4.3)) - 0.5) * 0.25;
    float spin = (hash(id + 8.8) - 0.5) * 0.5;
    mat2 R = rot(h * 40.0 + t * spin);
    vec2 lp = R * (fract(q) - 0.5 - o);

    float sz = mix(0.14, 0.25, hash(id + 5.5));
    vec2 v0 = sz * vec2(cos(0.0 + h * 2.0), sin(0.0 + h * 2.0) * 1.5) * mix(0.65, 1.0, hash(id + 2.2));
    vec2 v1 = sz * vec2(cos(2.1 + h * 3.0), sin(2.1 + h * 3.0) * 1.5) * mix(0.65, 1.0, hash(id + 3.3));
    vec2 v2 = sz * vec2(cos(4.2 - h * 2.0), sin(4.2 - h * 2.0) * 1.5) * mix(0.65, 1.0, hash(id + 6.6));

    float e = 0.004;
    float d0 = sdTri(lp, v0, v1, v2);
    float d = d0 * cell;
    float a = smoothstep(px, -px, d);
    if (a <= 0.0) continue;

    vec2 grad = vec2(sdTri(lp + vec2(e, 0.0), v0, v1, v2) - d0, sdTri(lp + vec2(0.0, e), v0, v1, v2) - d0);
    grad = normalize(grad + 1e-6) * R;
    float inner = -d;
    float bevel = 1.0 - smoothstep(0.0, 0.02 + 0.02 * k, inner);

    // Refraction: a tilted face shifts the backdrop; the bevel bends it hard near the edges.
    vec2 tilt = rot(t * spin * 0.7) * (vec2(hash(id + 9.1), hash(id + 7.7)) - 0.5);
    vec2 off = (tilt * 0.16 + grad * bevel * 0.07) * uRefract;
    vec3 glass = vec3(backdrop(p + off).r, backdrop(p + off * 1.12).g, backdrop(p + off * 1.25).b);
    glass = glass * 1.25 + vec3(0.025, 0.035, 0.06);

    float sweepPos = sin(t * 0.4 + h * 20.0) * sz;
    float sweep = smoothstep(sz * 0.12, 0.0, abs(dot(lp, vec2(0.8, 0.6)) - sweepPos));
    float rim = exp(-inner / (px * 1.6));
    glass += vec3(0.85, 0.92, 1.0) * (rim * 0.55 + bevel * 0.12 + sweep * 0.12);

    col = mix(col, glass, a * mix(0.5, 0.92, k));
  }

  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(v, v) * 0.9;
  col += (hash(gl_FragCoord.xy + fract(uTime) * 71.0) - 0.5) / 160.0;
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

export function AeroShards({
  colors = ["#38bdf8", "#a78bfa", "#f0abfc"],
  speed = 1,
  scale = 1,
  density = 0.55,
  refraction = 1,
  className,
}: AeroShardsProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, speed, scale, density, refraction });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, speed, scale, density, refraction };
    redraw.current?.();
  }, [colors, speed, scale, density, refraction]);

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
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let visible = true;
    let time = 12;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      const list = o.colors.length ? o.colors : ["#ffffff"];
      for (let i = 0; i < 3; i++) gl.uniform3fv(u(`uC${i}`), rgb(list[i % list.length]));
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uLook"), look.x, look.y);
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.2));
      gl.uniform1f(u("uDensity"), Math.min(Math.max(o.density, 0), 1));
      gl.uniform1f(u("uRefract"), o.refraction);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      look.x += (look.tx - look.x) * 0.04;
      look.y += (look.ty - look.y) * 0.04;
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
      look.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      look.ty = 1 - ((e.clientY - r.top) / r.height) * 2;
    };
    const onLeave = () => {
      look.tx = 0;
      look.ty = 0;
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
