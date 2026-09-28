"use client";

import { useEffect, useRef } from "react";

export interface CosmicBackgroundProps {
  /** Main nebula color. */
  color?: string;
  /** Secondary nebula color, mixed into the cloud edges. */
  accent?: string;
  /** Drift speed multiplier; 0 freezes the scene. */
  speed?: number;
  /** Size of the nebula clouds; higher means larger shapes. */
  scale?: number;
  /** Brightness of the nebula. */
  intensity?: number;
  /** Star density, 0..1. */
  stars?: number;
  /** Show an occasional shooting star. */
  shootingStars?: boolean;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uScale;
uniform float uIntensity;
uniform float uStars;
uniform float uShoot;

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
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

// One layer of stars: at most one star per grid cell.
vec3 stars(vec2 p, float cells, float bright, float t) {
  p *= cells;
  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;
  float h = hash(id);
  if (h > uStars) return vec3(0.0);
  vec2 o = (vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5) * 0.8;
  vec2 d = f - o;
  float r = length(d);
  float size = mix(0.015, 0.05, pow(hash(id + 3.7), 3.0));
  float core = exp(-r * r / (size * size));
  // Bigger stars get a faint cross flare.
  float flare = size > 0.035 ? max(0.0, 1.0 - abs(d.x) * 40.0) * max(0.0, 1.0 - abs(d.y) * 10.0)
                             + max(0.0, 1.0 - abs(d.y) * 40.0) * max(0.0, 1.0 - abs(d.x) * 10.0) : 0.0;
  float tw = 0.65 + 0.35 * sin(t * (1.5 + h * 4.0) + h * 60.0);
  vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.85, 0.7), hash(id + 9.2));
  float b = 0.25 + 0.75 * pow(hash(id + 5.5), 2.0);
  return tint * (core + flare * 0.35) * tw * bright * b;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;

  // Nebula: domain-warped noise with dark dust lanes cut through it.
  vec2 q = p * 1.6 / uScale + vec2(t * 0.012, t * 0.004);
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.02)), fbm(q + vec2(5.2, 1.3) - t * 0.015));
  float n = fbm(q + 2.2 * w);
  float dust = fbm(q * 2.3 + w * 1.5 + 11.0);
  // A soft diagonal band, like the plane of a galaxy, where the gas gathers.
  float band = exp(-pow((p.y + p.x * 0.45 + 0.08 * sin(p.x * 2.5 + t * 0.03)) * 2.2 / uScale, 2.0));
  float cloud = smoothstep(0.32, 0.85, n + band * 0.28 - 0.12) * (1.0 - smoothstep(0.5, 0.85, dust) * 0.7);
  vec3 neb = mix(uColor, uAccent, smoothstep(0.35, 0.7, w.x));
  vec3 col = vec3(0.004, 0.005, 0.016);
  col += neb * cloud * cloud * 1.3 * uIntensity + neb * cloud * 0.25 * uIntensity;
  col += mix(neb, vec3(1.0), 0.4) * pow(cloud, 5.0) * 0.8 * uIntensity;
  col += uAccent * 0.05 * uIntensity * smoothstep(0.2, 0.9, w.y);
  col += neb * band * 0.05 * uIntensity;

  // Parallax star layers: nearer layers drift faster and shine brighter.
  col += stars(p + vec2(t * 0.004, t * 0.001), 42.0, 0.55, t);
  col += stars(p + vec2(t * 0.009, t * 0.002) + 3.1, 24.0, 0.85, t);
  col += stars(p + vec2(t * 0.018, t * 0.004) + 7.7, 12.0, 1.1, t) * (0.6 + cloud);

  // Shooting star: a new chance every few seconds.
  if (uShoot > 0.5) {
    float period = 4.5;
    float k = floor(t / period);
    float local = t - k * period;
    if (hash(vec2(k, 3.7)) < 0.75 && local < 1.1) {
      float aspect = uRes.x / uRes.y;
      vec2 start = vec2((hash(vec2(k, 1.1)) * 0.9 - 0.1) * aspect, 0.25 + hash(vec2(k, 2.3)) * 0.3);
      float ang = -0.35 - hash(vec2(k, 5.9)) * 0.4;
      vec2 dir = vec2(-cos(ang), sin(ang));
      vec2 head = start + dir * local * 1.1;
      float len = 0.28;
      vec2 rel = p - head;
      float along = dot(rel, -dir);
      float across = length(rel + dir * along);
      float fade = smoothstep(0.0, 0.15, local) * smoothstep(1.1, 0.7, local);
      if (along > 0.0 && along < len) {
        float trail = pow(1.0 - along / len, 2.0);
        col += vec3(0.85, 0.9, 1.0) * trail * exp(-across * across * 90000.0 / (1.0 + along * 40.0)) * fade;
      }
      col += vec3(0.9, 0.95, 1.0) * 0.0002 / (dot(rel, rel) + 0.0002) * fade * 0.5;
    }
  }

  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 1.1;
  col = 1.0 - exp(-col * 1.4); // soft tonemap keeps bright cores from clipping
  col += (hash(gl_FragCoord.xy + fract(t) * 91.7) - 0.5) * 0.006;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
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

export function CosmicBackground({
  color = "#6d28d9",
  accent = "#db2777",
  speed = 1,
  scale = 1,
  intensity = 1,
  stars = 0.5,
  shootingStars = true,
  className,
}: CosmicBackgroundProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, accent, speed, scale, intensity, stars, shootingStars });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, accent, speed, scale, intensity, stars, shootingStars };
    redraw.current?.();
  }, [color, accent, speed, scale, intensity, stars, shootingStars]);

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
    let time = 30;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform3fv(u("uAccent"), rgb(o.accent));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.uniform1f(u("uIntensity"), o.intensity);
      gl.uniform1f(u("uStars"), Math.min(Math.max(o.stars, 0), 1));
      gl.uniform1f(u("uShoot"), o.shootingStars && !reduced ? 1 : 0);
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
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Shown only if WebGL is unavailable.
        background: `radial-gradient(ellipse at 30% 40%, ${color}40, transparent 60%), radial-gradient(ellipse at 75% 65%, ${accent}33, transparent 55%), #03040b`,
      }}
    />
  );
}
