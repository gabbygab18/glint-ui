"use client";

import { useEffect, useRef } from "react";

export interface PixelBlastProps {
  color?: string;
  shape?: "square" | "circle";
  /** Cell size in CSS px. */
  pixelSize?: number;
  /** 0–1, how much of the field is lit. */
  density?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Blast rings on click. */
  interactive?: boolean;
  /** Fire a blast at a random spot every few seconds. */
  autoBlast?: boolean;
  className?: string;
}

const MAX_BLASTS = 8;

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uPx;
uniform float uDensity;
uniform float uCircle;
uniform vec4 uBlast[${MAX_BLASTS}];

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){ return noise(p) * 0.55 + noise(p * 2.1 + 5.3) * 0.3 + noise(p * 4.3 + 1.7) * 0.15; }
// Ordered-dither threshold (8x8 Bayer), 0..1.
float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer8(vec2 a){ return (bayer2(0.25 * a) * 0.25 + bayer2(0.5 * a)) * 0.25 + bayer2(a); }

void main(){
  vec2 cell = floor(gl_FragCoord.xy / uPx);
  vec2 local = fract(gl_FragCoord.xy / uPx) - 0.5;
  vec2 c = (cell + 0.5) * uPx / uRes.y; // cell center, container-height units
  float t = uTime;

  float n = fbm(c * 3.0 + vec2(t * 0.07, -t * 0.05));
  float v = smoothstep(0.62 - uDensity * 0.45, 0.95 - uDensity * 0.3, n);
  v *= 0.75 + 0.25 * sin(t * 1.4 + n * 12.0); // breathing pulse

  float ring = 0.0;
  for (int i = 0; i < ${MAX_BLASTS}; i++) {
    vec4 b = uBlast[i];
    if (b.w > 0.001) {
      float d = length(c - b.xy);
      float front = b.z * 0.75;
      float x = d - front;
      float fade = exp(-b.z * 1.1) * b.w;
      ring += (exp(-x * x * 300.0) * 1.3 + exp(-x * x * 30.0) * 0.4 * step(x, 0.0)) * fade;
    }
  }
  v = clamp(v + ring, 0.0, 1.0);

  float on = step(bayer8(cell) + 0.001, v);
  float s = 0.42;
  float aa = 1.0 / uPx;
  float mask = uCircle > 0.5
    ? 1.0 - smoothstep(s - aa, s + aa, length(local))
    : (1.0 - smoothstep(s - aa, s + aa, abs(local.x))) * (1.0 - smoothstep(s - aa, s + aa, abs(local.y)));

  vec3 col = mix(uColor * (0.55 + 0.45 * v), vec3(1.0), min(ring, 1.0) * 0.55) * on * mask;
  gl_FragColor = vec4(col, on * mask);
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

export function PixelBlast({
  color = "#a78bfa",
  shape = "square",
  pixelSize = 6,
  density = 0.5,
  speed = 1,
  interactive = true,
  autoBlast = true,
  className,
}: PixelBlastProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color: hexToRgb(color), shape, pixelSize, density, speed, interactive, autoBlast });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { color: hexToRgb(color), shape, pixelSize, density, speed, interactive, autoBlast };
    redraw.current?.();
  }, [color, shape, pixelSize, density, speed, interactive, autoBlast]);

  useEffect(() => {
    const el = host.current!;
    const area = el.parentElement ?? el;
    // Blast ring buffer: x, y (container-height units, y up), age in seconds, strength.
    const blasts = new Float32Array(MAX_BLASTS * 4);
    let next = 0;
    let t = 4;
    let idle = 1.8;
    const add = (x: number, y: number, s: number) => {
      blasts.set([x, y, 0, s], next * 4);
      next = (next + 1) % MAX_BLASTS;
    };

    const shader = mountShader(el, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      for (let i = 0; i < MAX_BLASTS; i++) {
        blasts[i * 4 + 2] += dt * o.speed;
        if (blasts[i * 4 + 2] > 4) blasts[i * 4 + 3] = 0;
      }
      idle += dt;
      if (o.autoBlast && idle > 1.0) {
        idle = 0;
        const aspect = el.clientWidth / Math.max(el.clientHeight, 1);
        add((0.15 + Math.random() * 0.7) * aspect, 0.15 + Math.random() * 0.7, 0.9);
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      set("uTime", t);
      set("uColor", o.color);
      set("uPx", Math.max(2, o.pixelSize) * dpr);
      set("uDensity", Math.min(Math.max(o.density, 0), 1));
      set("uCircle", o.shape === "circle" ? 1 : 0);
      set("uBlast", Array.from(blasts), 4);
    });
    if (!shader) return;
    redraw.current = shader.redraw;

    const onDown = (e: PointerEvent) => {
      if (!opts.current.interactive) return;
      const r = el.getBoundingClientRect();
      idle = 0;
      add((e.clientX - r.left) / r.height, 1 - (e.clientY - r.top) / r.height, 1.4);
    };
    area.addEventListener("pointerdown", onDown);
    return () => {
      redraw.current = undefined;
      area.removeEventListener("pointerdown", onDown);
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
