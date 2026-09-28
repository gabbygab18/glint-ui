"use client";

import { useEffect, useRef } from "react";

export interface MoltenMetalProps {
  /** Color of the cooled, dark crust. */
  crustColor?: string;
  /** Deep glow of the molten flow. */
  glowColor?: string;
  /** Hottest, brightest cracks. */
  hotColor?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Plate size; higher gives smaller plates. */
  scale?: number;
  /** Width of the glowing cracks. */
  crackWidth?: number;
  intensity?: number;
  className?: string;
}

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCrust;
uniform vec3 uGlow;
uniform vec3 uHot;
uniform float uScale;
uniform float uCrack;
uniform float uIntensity;

vec2 hash2(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i).x, hash2(i + vec2(1, 0)).x, f.x), mix(hash2(i + vec2(0, 1)).x, hash2(i + vec2(1, 1)).x, f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.07 + 13.7; a *= 0.5; }
  return v;
}
vec2 site(vec2 cell, float t){ return 0.5 + 0.4 * sin(t + 6.2831 * hash2(cell)); }

// x: distance to the nearest plate center, y: distance to the nearest plate border.
vec2 plates(vec2 x, float t){
  vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 r = g + site(n + g, t) - f;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  float bd = 8.0;
  for (int j = -2; j <= 2; j++)
  for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j));
    vec2 r = g + site(n + g, t) - f;
    vec2 dr = r - mr;
    if (dot(dr, dr) > 1e-5) bd = min(bd, dot(0.5 * (mr + r), normalize(dr)));
  }
  return vec2(sqrt(md), bd);
}

void main(){
  float t = uTime;
  vec2 p = gl_FragCoord.xy / uRes.y * uScale;
  p += vec2(t * 0.05, t * 0.018);
  p += (vec2(fbm(p * 0.45 + t * 0.03), fbm(p * 0.45 + 7.3 - t * 0.03)) - 0.5) * 1.3;

  vec2 v = plates(p, t * 0.22);
  float heat = fbm(p * 0.55 - t * 0.06);
  float pulse = 0.85 + 0.15 * sin(t * 1.3 + heat * 9.0);
  float hot = smoothstep(0.25, 0.66, heat);
  float w = uCrack * mix(0.25, 1.5, hot);
  float crack = 1.0 - smoothstep(0.0, w, v.y);
  float bloom = exp(-v.y / (w * 2.5 + 0.001));
  // Finer fissures breaking up the hotter plates.
  vec2 v2 = plates(p * 2.6 + 11.0, t * 0.3);
  float fine = (1.0 - smoothstep(0.0, uCrack * 0.3, v2.y)) * smoothstep(0.4, 0.75, heat);
  float rock = fbm(p * 5.0 + 3.1);

  float h = crack * mix(0.45, 1.15, hot) * pulse + bloom * mix(0.12, 0.4, hot) + fine * 0.55
          + smoothstep(0.5, 0.85, heat) * (1.0 - v.x) * 0.3;
  h *= uIntensity;

  vec3 col = uCrust * (0.3 + 1.6 * rock * rock) * (0.5 + 0.5 * smoothstep(0.0, 0.3, v.y));
  col = mix(col, uGlow * 0.45, smoothstep(0.08, 0.4, h));
  col = mix(col, uGlow, smoothstep(0.3, 0.65, h));
  col = mix(col, uHot, smoothstep(0.62, 0.95, h));
  col = mix(col, vec3(1.0, 0.97, 0.9), smoothstep(0.98, 1.35, h));
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

type SetUniform = (name: string, v: number | number[], size?: number) => void;

/** Full-screen-triangle WebGL runner: sizes to its host, pauses offscreen, one static frame under reduced motion. */
function mountShader(host: HTMLElement, frag: string, frame: (set: SetUniform, dt: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  const stages: [number, string][] = [
    [gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"],
    [gl.FRAGMENT_SHADER, frag],
  ];
  for (const [type, src] of stages) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    gl.attachShader(prog, s);
  }
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  host.appendChild(canvas);

  const locs = new Map<string, WebGLUniformLocation | null>();
  const setters = [gl.uniform1fv, gl.uniform2fv, gl.uniform3fv, gl.uniform4fv];
  const set: SetUniform = (name, v, size) => {
    if (!locs.has(name)) locs.set(name, gl.getUniformLocation(prog, name));
    const arr = typeof v === "number" ? [v] : v;
    setters[(size ?? arr.length) - 1].call(gl, locs.get(name)!, arr);
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let last = 0;
  const render = (dt: number) => {
    set("uRes", [canvas.width, canvas.height]);
    frame(set, dt);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    render(last ? Math.min((now - last) / 1000, 0.1) : 0);
    last = now;
    raf = requestAnimationFrame(loop);
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    render(0);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (e.isIntersecting && !reduced) raf = requestAnimationFrame(loop);
  });
  io.observe(host);

  return {
    redraw: () => {
      if (!raf) render(0);
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

export function MoltenMetal({
  crustColor = "#1c100c",
  glowColor = "#ff4d12",
  hotColor = "#ffc861",
  speed = 1,
  scale = 3,
  crackWidth = 0.08,
  intensity = 1,
  className,
}: MoltenMetalProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ crust: hexToRgb(crustColor), glow: hexToRgb(glowColor), hot: hexToRgb(hotColor), speed, scale, crackWidth, intensity });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { crust: hexToRgb(crustColor), glow: hexToRgb(glowColor), hot: hexToRgb(hotColor), speed, scale, crackWidth, intensity };
    redraw.current?.();
  }, [crustColor, glowColor, hotColor, speed, scale, crackWidth, intensity]);

  useEffect(() => {
    let t = 9;
    const shader = mountShader(host.current!, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      set("uTime", t);
      set("uCrust", o.crust);
      set("uGlow", o.glow);
      set("uHot", o.hot);
      set("uScale", Math.max(o.scale, 0.2));
      set("uCrack", Math.max(o.crackWidth, 0.005));
      set("uIntensity", o.intensity);
    });
    if (!shader) return;
    redraw.current = shader.redraw;
    return () => {
      redraw.current = undefined;
      shader.destroy();
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
