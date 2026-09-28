"use client";

import { useEffect, useRef } from "react";

export interface LightfallProps {
  colorA?: string;
  colorB?: string;
  /** Fall speed multiplier. */
  speed?: number;
  /** Streak columns per container height (front layer). */
  density?: number;
  /** Trail length, in container heights. */
  length?: number;
  /** Brightness and bloom. */
  glow?: number;
  className?: string;
}

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDensity;
uniform float uLength;
uniform float uGlow;

float hash(float n){ return fract(sin(n * 91.3458) * 47453.5453); }

// One depth layer of falling streaks. scale > 1 means farther away: thinner, slower, dimmer.
vec3 layer(vec2 uv, float scale, float seed, float bright){
  float cols = uDensity * scale;
  float cx = uv.x * cols + seed * 17.0;
  float id = floor(cx);
  float h1 = hash(id + seed);
  float h2 = hash(id * 1.73 + seed + 3.1);
  float h3 = hash(id * 2.31 + seed + 7.7);
  float dx = (fract(cx) - 0.5 - (h3 - 0.5) * 0.6) / cols;

  float len = uLength * mix(0.6, 1.4, h2) / sqrt(scale);
  float spd = mix(0.35, 0.8, h2) / sqrt(scale);
  float period = 1.3 + len + h1 * 1.5;
  float head = 1.1 - fract(uTime * spd / period + h1 * 7.0) * period;
  float d = uv.y - head;
  float trail = d > 0.0 ? exp(-d / len) * (1.0 - exp(-d * 60.0)) + exp(-d * 90.0) : exp(d * 140.0);

  float w = 0.0016 / scale * uGlow;
  float core = exp(-dx * dx / (w * w));
  float halo = exp(-abs(dx) / (w * 7.0)) * 0.3;
  float flare = exp(-d * d / 0.0003) * exp(-dx * dx / (w * w * 16.0)) * 0.8;
  float on = step(0.3, fract(h1 * 13.7 + h2)); // leave some columns empty
  vec3 tint = mix(uColorA, uColorB, h3);
  return tint * ((core + halo) * trail + flare) * bright * on;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec3 col = layer(uv, 3.4, 5.0, 0.32) + layer(uv, 1.9, 2.0, 0.6) + layer(uv, 1.0, 0.0, 1.0);
  col *= uGlow;
  col += vec3(1.0) * pow(max(col.r, max(col.g, col.b)), 3.0) * 0.3;
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
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

export function Lightfall({
  colorA = "#67e8f9",
  colorB = "#a78bfa",
  speed = 1,
  density = 12,
  length = 0.35,
  glow = 1,
  className,
}: LightfallProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ a: hexToRgb(colorA), b: hexToRgb(colorB), speed, density, length, glow });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { a: hexToRgb(colorA), b: hexToRgb(colorB), speed, density, length, glow };
    redraw.current?.();
  }, [colorA, colorB, speed, density, length, glow]);

  useEffect(() => {
    let t = 11;
    const shader = mountShader(host.current!, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      set("uTime", t);
      set("uColorA", o.a);
      set("uColorB", o.b);
      set("uDensity", Math.max(o.density, 1));
      set("uLength", Math.max(o.length, 0.02));
      set("uGlow", Math.max(o.glow, 0.05));
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
