"use client";

import { useEffect, useRef } from "react";

export interface LightningProps {
  /** Bolt hue in degrees (0–360). */
  hue?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Bolt and flash brightness. */
  intensity?: number;
  /** Bolt scale; larger zooms in. */
  size?: number;
  /** Horizontal position of the bolt, -1 (left) to 1 (right). */
  xOffset?: number;
  /** Seconds between strikes at speed 1. */
  interval?: number;
  className?: string;
}

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHue;
uniform float uIntensity;
uniform float uSize;
uniform float uX;
uniform float uInterval;

float hash(float n){ return fract(sin(n * 78.233) * 43758.5453); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
vec3 hsv(float h, float s, float v){
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return v * mix(vec3(1.0), k, s);
}

// Jagged horizontal offset of a bolt at height y.
float path(float y, float seed, float t){
  return (fbm(vec2(y * 1.8, seed + t * 0.08)) - 0.5) * 0.9 + (fbm(vec2(y * 7.0, seed * 1.3 + t * 0.4)) - 0.5) * 0.12;
}

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 q = p / uSize;
  q.x -= uX * 0.5 * uRes.x / uRes.y / uSize;
  float t = uTime;

  float cyc = floor(t / uInterval);
  float lt = t - cyc * uInterval;          // time since the last strike
  float seed = hash(cyc + 1.0) * 60.0;
  float flash = exp(-lt * 3.5) * (0.6 + 0.4 * step(0.0, sin(lt * 42.0))) + exp(-max(lt - 0.18, 0.0) * 9.0) * step(0.18, lt) * 0.6;
  float env = 0.5 + 1.5 * flash;

  // Main bolt.
  float x0 = path(q.y, seed, t);
  float d = abs(q.x - x0);
  float glow = 0.003 / (d + 0.0015);
  float core = exp(-d * d / 0.000004);

  // Branches forking off the main bolt.
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float by = 0.45 - hash(seed + fi * 7.1) * 0.8;
    float len = 0.12 + hash(seed + fi * 3.3) * 0.35;
    float k = by - q.y;
    if (k > 0.0 && k < len) {
      float side = hash(seed + fi * 1.7) > 0.5 ? 1.0 : -1.0;
      float bx = path(by, seed, t) + side * k * (0.35 + hash(seed + fi * 5.9) * 0.9)
               + (fbm(vec2(q.y * 5.0, seed + fi * 13.0 + t * 0.3)) - 0.5) * 0.5 * k + (noise(vec2(q.y * 40.0, seed + fi)) - 0.5) * 0.012;
      float bd = abs(q.x - bx);
      float fade = 1.0 - k / len;
      glow += 0.0009 / (bd + 0.0012) * fade * fade;
      core += exp(-bd * bd / 0.0000025) * fade;
    }
  }

  vec3 tint = hsv(uHue / 360.0, 0.75, 1.0);
  vec3 col = tint * glow * env + vec3(1.0) * min(core, 1.0) * env;
  // Clouds lit from within on each strike.
  float cloud = fbm(p * 2.2 + vec2(t * 0.03, 0.0)) * smoothstep(-0.2, 0.55, p.y);
  float xs = (fbm(vec2(q.y * 1.8, seed + t * 0.08)) - 0.5) * 0.9; // smooth path for the glow
  float near = exp(-abs(q.x - xs) * 2.5);
  col += tint * (flash * 0.9 + 0.06) * cloud * cloud * (0.35 + 0.65 * near);
  col += tint * (flash * 0.28 + 0.03) * near + tint * flash * 0.05;
  col *= uIntensity;
  col += (hash2(gl_FragCoord.xy) - 0.5) / 255.0;
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}`;

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

export function Lightning({
  hue = 230,
  speed = 1,
  intensity = 1,
  size = 1,
  xOffset = 0,
  interval = 2.4,
  className,
}: LightningProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ hue, speed, intensity, size, xOffset, interval });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { hue, speed, intensity, size, xOffset, interval };
    redraw.current?.();
  }, [hue, speed, intensity, size, xOffset, interval]);

  useEffect(() => {
    // Start just after a strike so a static (reduced-motion) frame shows a lit bolt.
    let t = 0.06;
    const shader = mountShader(host.current!, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      set("uTime", t);
      set("uHue", o.hue);
      set("uIntensity", o.intensity);
      set("uSize", Math.max(o.size, 0.1));
      set("uX", o.xOffset);
      set("uInterval", Math.max(o.interval, 0.3));
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
