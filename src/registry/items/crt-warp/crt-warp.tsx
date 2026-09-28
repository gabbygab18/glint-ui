"use client";

import { useEffect, useRef } from "react";

export interface CrtWarpProps {
  /** Three gradient colors, bottom to top. */
  colors?: string[];
  /** Gradient drift speed multiplier; 0 freezes it. */
  speed?: number;
  /** Barrel curvature of the tube (0 is flat). */
  curvature?: number;
  /** Scanline darkness (0 to 1). */
  scanlines?: number;
  /** RGB aperture mask strength (0 to 1). */
  mask?: number;
  /** Brightness flicker and rolling bar strength (0 to 1). */
  flicker?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uClock;
uniform float uDpr;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uCurve;
uniform float uScan;
uniform float uMask;
uniform float uFlicker;

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
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

// The picture on the tube: a slow, glowing three-color gradient.
vec3 scene(vec2 uv) {
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
  float t = uTime * 0.2;
  float n = fbm(p * 1.5 + vec2(t * 0.6, -t * 0.4));
  float g = uv.y * 0.95 + (n - 0.5) * 0.75;
  vec3 col = mix(uC0, uC1, smoothstep(0.02, 0.5, g));
  col = mix(col, uC2, smoothstep(0.45, 0.95, g));
  vec2 c1 = vec2(sin(t * 0.9) * 0.35 * asp, cos(t * 0.7) * 0.15 + 0.05);
  vec2 c2 = vec2(cos(t * 0.6 + 2.0) * 0.4 * asp, sin(t * 0.8) * 0.2 - 0.1);
  col += uC2 * 0.6 * exp(-dot(p - c1, p - c1) * 5.0);
  col += uC1 * 0.45 * exp(-dot(p - c2, p - c2) * 4.0);
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 cc = uv * 2.0 - 1.0;
  // Barrel distortion: push the image outward the further it is from the center.
  cc *= 1.0 + uCurve * vec2(0.08, 0.12) * dot(cc, cc);
  cc *= 1.0 + uCurve * 0.03;
  vec2 suv = cc * 0.5 + 0.5;

  // Rounded screen edge.
  float rad = 0.04 + 0.08 * uCurve;
  vec2 q = abs(cc) - (1.0 - rad);
  float box = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;
  float inside = 1.0 - smoothstep(-0.004, 0.004, box);

  // Rolling bar with a slight horizontal wobble.
  float roll = fract(suv.y * 0.6 - uClock * 0.09);
  float rb = (roll - 0.5) / 0.07;
  float bar = exp(-rb * rb) * uFlicker;
  suv.x += bar * 0.002 * sin(suv.y * 200.0 + uClock * 20.0);

  // Chromatic fringing grows toward the edges.
  vec2 off = cc * (0.0025 + 0.004 * uCurve);
  vec3 col = vec3(scene(suv + off).r, scene(suv).g, scene(suv - off).b);

  float sl = 0.5 + 0.5 * cos(suv.y * uRes.y / uDpr / 3.0 * 6.2832);
  col *= 1.0 - uScan * 0.55 * sl;

  float m = mod(floor(gl_FragCoord.x / uDpr), 3.0);
  vec3 grille = vec3(step(m, 0.5), step(0.5, m) * step(m, 1.5), step(1.5, m));
  col *= mix(vec3(1.0), 0.55 + grille * 0.9, uMask * 0.55);

  col *= 1.0 + bar * 0.18;
  float flick = sin(uClock * 110.0) * 0.5 + 0.5;
  col *= 1.0 - uFlicker * (0.03 * flick + 0.05 * hash(vec2(floor(uClock * 24.0), 3.0)));
  col += (hash(gl_FragCoord.xy + fract(uClock) * 311.0) - 0.5) * 0.05;
  col *= 1.25 - 0.6 * dot(cc * 0.72, cc * 0.72);

  // Dark bezel catching a faint reflection of the screen glow.
  vec3 bezel = vec3(0.012, 0.012, 0.016) + scene(clamp(suv, 0.0, 1.0)) * 0.12 * exp(-max(box, 0.0) * 22.0);
  gl_FragColor = vec4(mix(bezel, max(col, 0.0), inside), 1.0);
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

export function CrtWarp({
  colors = ["#1a0b3d", "#ff2e88", "#ffb347"],
  speed = 1,
  curvature = 0.5,
  scanlines = 0.6,
  mask = 0.5,
  flicker = 0.5,
  className,
}: CrtWarpProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, speed, curvature, scanlines, mask, flicker });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, speed, curvature, scanlines, mask, flicker };
    redraw.current?.();
  }, [colors, speed, curvature, scanlines, mask, flicker]);

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
    let time = 6;
    let clock = 3;
    let last = 0;
    let dpr = 1;

    const draw = () => {
      const o = opts.current;
      const list = o.colors.length ? o.colors : ["#ffffff"];
      for (let i = 0; i < 3; i++) gl.uniform3fv(u(`uC${i}`), rgb(list[i % list.length]));
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform1f(u("uClock"), clock);
      gl.uniform1f(u("uDpr"), dpr);
      gl.uniform1f(u("uCurve"), Math.max(o.curvature, 0));
      gl.uniform1f(u("uScan"), Math.min(Math.max(o.scanlines, 0), 1));
      gl.uniform1f(u("uMask"), Math.min(Math.max(o.mask, 0), 1));
      gl.uniform1f(u("uFlicker"), Math.min(Math.max(o.flicker, 0), 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      time += dt * opts.current.speed;
      clock += dt;
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
