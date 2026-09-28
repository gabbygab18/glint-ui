"use client";

import { useEffect, useRef } from "react";

export interface LiquidEtherProps {
  /** Three colors blended through the flow. */
  colors?: string[];
  /** Animation speed multiplier. */
  speed?: number;
  /** Noise scale; higher gives finer wisps. */
  scale?: number;
  /** How hard the cursor stirs the ether. */
  swirl?: number;
  intensity?: number;
  /** When the cursor is away, an invisible hand keeps stirring. */
  autoStir?: boolean;
  className?: string;
}

const TRAIL = 16;

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uScale;
uniform float uSwirl;
uniform float uIntensity;
uniform vec4 uTrail[${TRAIL}];

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 p = gl_FragCoord.xy / uRes.y;
  vec2 w = p;
  float energy = 0.0;
  // Each trail point drags the domain along its motion and curls it around itself.
  for (int i = 0; i < ${TRAIL}; i++) {
    vec4 s = uTrail[i];
    vec2 d = p - s.xy;
    float f = exp(-dot(d, d) * 28.0);
    float sp = length(s.zw);
    w -= s.zw * f * 0.12 * uSwirl;
    w += vec2(-d.y, d.x) * f * sp * uSwirl * 0.7;
    energy += f * sp;
  }

  vec2 q = w * uScale;
  float t = uTime * 0.22;
  vec2 a = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, 1.3) - t));
  vec2 b = vec2(fbm(q + 3.5 * a + vec2(1.7, 9.2) + t * 0.7), fbm(q + 3.5 * a + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(q + 3.0 * b);

  vec3 col = mix(uC1, uC2, smoothstep(0.35, 0.7, a.y));
  col = mix(col, uC3, smoothstep(0.45, 1.0, length(b) * 0.85 + (a.x - 0.5)));
  float lum = smoothstep(0.3, 1.05, f * f * 1.7 + 0.25 * b.y);
  col *= lum * lum * (1.0 + min(energy, 1.5) * 0.6) * uIntensity;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
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

const DEFAULT_COLORS = ["#7c3aed", "#22d3ee", "#f472b6"];
const toColors = (c: string[]) => [0, 1, 2].map((i) => hexToRgb(c[i] ?? c[0] ?? "#ffffff"));

export function LiquidEther({
  colors = DEFAULT_COLORS,
  speed = 1,
  scale = 2.2,
  swirl = 1,
  intensity = 1.2,
  autoStir = true,
  className,
}: LiquidEtherProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors: toColors(colors), speed, scale, swirl, intensity, autoStir });
  const redraw = useRef<() => void>(undefined);
  const colorKey = colors.join(",");

  useEffect(() => {
    opts.current = { colors: toColors(colorKey.split(",")), speed, scale, swirl, intensity, autoStir };
    redraw.current?.();
  }, [colorKey, speed, scale, swirl, intensity, autoStir]);

  useEffect(() => {
    const el = host.current!;
    const area = el.parentElement ?? el;
    // Trail ring buffer: x, y (container-height units, y up), vx, vy (units per second).
    const trail = new Float32Array(TRAIL * 4).fill(-10);
    let next = 0;
    let t = 8;
    let idle = 10;
    let ghost = 0;
    const last = { x: 0, y: 0, time: 0 };

    const push = (x: number, y: number, now: number) => {
      const dt = Math.max((now - last.time) / 1000, 1 / 120);
      const vx = Math.max(-3, Math.min(3, (x - last.x) / dt));
      const vy = Math.max(-3, Math.min(3, (y - last.y) / dt));
      const fresh = now - last.time > 200;
      last.x = x;
      last.y = y;
      last.time = now;
      if (fresh) return;
      trail.set([x, y, vx, vy], next * 4);
      next = (next + 1) % TRAIL;
    };

    const shader = mountShader(el, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      const decay = Math.exp(-dt * 1.2);
      for (let i = 0; i < TRAIL; i++) {
        trail[i * 4 + 2] *= decay;
        trail[i * 4 + 3] *= decay;
      }
      idle += dt;
      if (o.autoStir && idle > 2.5 && dt > 0) {
        ghost += dt;
        const aspect = el.clientWidth / Math.max(el.clientHeight, 1);
        const gx = aspect * (0.5 + 0.32 * Math.sin(ghost * 0.7));
        const gy = 0.5 + 0.28 * Math.sin(ghost * 1.1 + 1);
        const now = performance.now();
        if (now - last.time > 45) push(gx, gy, now);
      }
      const [c1, c2, c3] = o.colors;
      set("uTime", t);
      set("uC1", c1);
      set("uC2", c2);
      set("uC3", c3);
      set("uScale", Math.max(o.scale, 0.2));
      set("uSwirl", o.swirl);
      set("uIntensity", o.intensity);
      set("uTrail", Array.from(trail), 4);
    });
    if (!shader) return;
    redraw.current = shader.redraw;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      idle = 0;
      push((e.clientX - r.left) / r.height, 1 - (e.clientY - r.top) / r.height, performance.now());
    };
    area.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      redraw.current = undefined;
      area.removeEventListener("pointermove", onMove);
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
