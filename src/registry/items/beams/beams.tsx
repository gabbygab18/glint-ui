"use client";

import { useEffect, useRef } from "react";

export interface BeamsProps {
  /** Light color of the beams. */
  color?: string;
  /** Number of beams (1 to 16). */
  count?: number;
  /** Slant in degrees; 0 is straight down. */
  angle?: number;
  /** Drift speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Overall brightness. */
  intensity?: number;
  /** How much drifting haze breaks up the beams (0 to 1). */
  haze?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uCount;
uniform float uAngle;
uniform float uIntensity;
uniform float uHaze;
uniform float uSeed;

float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
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
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float ca = cos(uAngle), sa = sin(uAngle);
  // q.x runs across the beams, q.y along them (source at the top).
  vec2 q = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
  float t = uTime;
  float span = uRes.x / uRes.y + 0.6;
  float fromTop = 0.75 - q.y;

  float sum = 0.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    if (fi >= uCount) break;
    float h1 = hash1(fi + 1.3), h2 = hash1(fi * 3.7 + 2.1), h3 = hash1(fi * 7.9 + 5.4);
    float c = ((fi + 0.5) / uCount - 0.5) * span + (h1 - 0.5) * span / uCount * 0.8
            + sin(t * (0.12 + 0.1 * h2) + fi * 2.4) * 0.07;
    float w = mix(0.012, 0.07, h2) * (0.6 + fromTop * 0.45);
    float x = (q.x - c) / w;
    float pulse = 0.6 + 0.4 * sin(t * (0.25 + 0.35 * h3) + fi * 1.7);
    sum += exp(-x * x) * pulse * mix(0.4, 1.0, h3);
    // a faint wide halo around each beam
    sum += exp(-x * x * 0.04) * 0.05 * pulse;
  }

  // Haze drifts down the beams: stretched along them, fine across them.
  float n = fbm(vec2(q.x * 9.0, q.y * 1.4 + t * 0.18));
  float n2 = fbm(vec2(q.x * 3.0 - t * 0.05, q.y * 0.6 + t * 0.1));
  float dust = mix(1.0, n * n2 * 3.2, uHaze);
  // Dust motes glinting inside the light, drifting down the beams.
  vec2 mg = vec2(q.x, q.y + t * 0.05) * 55.0;
  vec2 mi = floor(mg);
  float mh = hash(mi);
  float md = length(fract(mg) - 0.5 - (vec2(hash(mi + 3.1), hash(mi + 7.7)) - 0.5) * 0.6);
  float motes = step(0.8, mh) * smoothstep(0.13, 0.0, md) * (0.5 + 0.5 * sin(t * 2.0 + mh * 60.0)) * 3.0 * uHaze;

  float fade = smoothstep(2.0, -0.1, fromTop);
  float light = sum * dust * fade * uIntensity;

  vec3 col = vec3(0.006, 0.007, 0.012) + uColor * 0.035 * (1.0 - uv.y * 0.6);
  col += uColor * light * 0.55;
  col += mix(uColor, vec3(1.0), 0.6) * (light * light * 0.16 + sum * fade * motes * uIntensity);
  // soft source glow along the top edge
  col += uColor * 0.12 * uIntensity * smoothstep(0.55, 1.1, uv.y + (n2 - 0.5) * 0.2);

  col = 1.0 - exp(-col * 1.4);
  col += (hash(gl_FragCoord.xy + uSeed * 57.3) - 0.5) / 128.0;
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

export function Beams({
  color = "#9fb4ff",
  count = 9,
  angle = 28,
  speed = 1,
  intensity = 1,
  haze = 0.7,
  className,
}: BeamsProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, count, angle, speed, intensity, haze });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, count, angle, speed, intensity, haze };
    redraw.current?.();
  }, [color, count, angle, speed, intensity, haze]);

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
    let time = 8;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform1f(u("uCount"), Math.round(Math.min(Math.max(o.count, 1), 16)));
      gl.uniform1f(u("uAngle"), (o.angle * Math.PI) / 180);
      gl.uniform1f(u("uIntensity"), o.intensity);
      gl.uniform1f(u("uHaze"), Math.min(Math.max(o.haze, 0), 1));
      gl.uniform1f(u("uSeed"), reduced ? 0 : Math.random());
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
