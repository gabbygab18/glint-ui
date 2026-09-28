"use client";

import { useEffect, useRef } from "react";

export interface HyperspeedProps {
  /** Oncoming light trails (left side). */
  leftColor?: string;
  /** Outgoing light trails (right side). */
  rightColor?: string;
  /** Roadside light posts and lane markings. */
  sideColor?: string;
  /** Cruise speed multiplier. */
  speed?: number;
  /** Speed multiplier while the pointer is held down. */
  boost?: number;
  /** Share of lanes carrying light trails, 0-1. */
  density?: number;
  className?: string;
}

const FRAG = `
precision highp float;
float sq(float v) { return v * v; }
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uDown;
uniform vec3 uLeft;
uniform vec3 uRight;
uniform vec3 uSide;
uniform float uDensity;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

// light trails along a line in depth; z is world depth, returns brightness
float trails(float z, float seed, float cell, float stretch) {
  float c = floor(z / cell);
  float f = fract(z / cell);
  if (hash(c * 1.37 + seed * 17.1) > uDensity) return 0.0;
  float start = hash(c + seed * 3.3) * 0.3;
  float len = min((0.25 + 0.4 * hash(c * 2.1 + seed)) * stretch, 0.95 - start);
  float x = (f - start) / len;
  return smoothstep(0.0, 0.04, x) * smoothstep(1.0, 0.6, x) * mix(1.0, 0.3, clamp(x, 0.0, 1.0))
    * (0.6 + 0.4 * hash(c + seed * 9.0));
}

void main() {
  vec2 p = (gl_FragCoord.xy - uRes * vec2(0.5, 0.55)) / uRes.y;
  p *= 1.0 + 0.4 * uDown;                        // field of view kicks out when boosting
  p.x += (uMouse.x - 0.5) * 0.1 * uHover;        // steer a little with the cursor
  float t = uTime;
  float stretch = 1.0 + 0.8 * uDown;
  vec3 col = vec3(0.0);

  // sky glow at the vanishing point
  col += mix(uLeft, uRight, smoothstep(-0.4, 0.4, p.x)) * 0.1 * exp(-length(p * vec2(0.5, 2.5)) * 3.0);

  if (p.y < 0.0) {
    float z = 0.3 / -p.y;
    float x = p.x * z;
    float fog = exp(-z * 0.02);
    float px = z / uRes.y;  // world size of a pixel at this depth
    col += vec3(0.012, 0.012, 0.024) * smoothstep(4.0, 3.2, abs(x)) * fog;
    // four lanes each side: pairs of lights, left oncoming, right outgoing
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float lx = 0.45 + fi * 0.8;
      for (int s = 0; s < 2; s++) {
        float side = s == 0 ? -1.0 : 1.0;
        float d = abs(x - side * lx);
        float pair = exp(-sq((abs(d - 0.14)) / (0.03 + px * 1.5)));
        float glow = exp(-d / 0.3) * 0.18;
        float zz = s == 0 ? z + t * 70.0 : z - t * 30.0 + 400.0;
        col += (s == 0 ? uLeft : uRight) * trails(zz, fi + side * 5.0, 22.0, stretch) * (pair + glow) * fog * 1.8;
      }
    }
    // dashed center line and road edges
    float dash = smoothstep(0.35, 0.45, fract((z + t * 45.0) / 8.0)) * smoothstep(0.95, 0.85, fract((z + t * 45.0) / 8.0));
    col += uSide * 0.18 * exp(-sq(x / (0.02 + px))) * dash * fog;
    col += uSide * 0.15 * exp(-sq((abs(x) - 3.6) / (0.02 + px))) * fog;
  }

  // roadside: lamps and light trails on invisible walls at |x| = 4.6
  float ax = abs(p.x);
  if (ax > 0.002) {
    float wz = 4.6 / ax;
    float wy = p.y * wz + 0.3;
    float fogw = exp(-wz * 0.02);
    float lampZ = fract((wz + t * 45.0) / 12.0);
    float lamp = smoothstep(0.93, 0.95, lampZ) * smoothstep(1.0, 0.98, lampZ) * exp(-sq((wy - 1.4) / 0.05));
    col += uSide * lamp * 1.5 * fogw;
    float rail = exp(-sq((wy - 0.6) / 0.025));
    col += mix(uLeft, uRight, step(0.0, p.x)) * rail * trails(wz + t * 60.0, sign(p.x) * 11.0, 16.0, stretch) * fogw;
  }

  col = 1.0 - exp(-col * 1.6);
  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

type Ptr = { x: number; y: number; hover: number; down: number };
type Uni = (name: string) => WebGLUniformLocation | null;

/** Full-screen shader canvas inside `host`: DPR-capped resize, offscreen pause, reduced motion, eased pointer. */
function runShader(host: HTMLElement, frag: string, speed: (p: Ptr) => number, update: (gl: WebGLRenderingContext, u: Uni) => void) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
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
  const u: Uni = (n) => {
    if (!locs.has(n)) locs.set(n, gl.getUniformLocation(prog, n));
    return locs.get(n) ?? null;
  };
  const zone = host.parentElement ?? host;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ptr: Ptr = { x: 0.5, y: 0.5, hover: 0, down: 0 };
  const goal: Ptr = { ...ptr };
  let raf = 0;
  let last = 0;
  let time = 0;

  const draw = () => {
    gl.uniform2f(u("uRes"), canvas.width, canvas.height);
    gl.uniform1f(u("uTime"), time);
    gl.uniform2f(u("uMouse"), ptr.x, ptr.y);
    gl.uniform1f(u("uHover"), ptr.hover);
    gl.uniform1f(u("uDown"), ptr.down);
    update(gl, u);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const k = 1 - Math.exp(-dt * 4);
    for (const key of ["x", "y", "hover", "down"] as const) ptr[key] += (goal[key] - ptr[key]) * k;
    time += dt * speed(ptr);
    draw();
    raf = requestAnimationFrame(loop);
  };
  const run = (on: boolean) => {
    if (on && !raf && !reduced) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  };
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    goal.x = (e.clientX - r.left) / r.width;
    goal.y = 1 - (e.clientY - r.top) / r.height;
    goal.hover = 1;
  };
  const leave = () => {
    goal.hover = 0;
    goal.down = 0;
  };
  const press = () => {
    goal.down = 1;
  };
  const release = () => {
    goal.down = 0;
  };
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([e]) => run(e.isIntersecting));
  ro.observe(host);
  io.observe(host);
  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerleave", leave);
  zone.addEventListener("pointerdown", press);
  zone.addEventListener("pointerup", release);
  zone.addEventListener("pointercancel", release);
  return {
    redraw: () => {
      if (!raf) draw();
    },
    dispose: () => {
      run(false);
      ro.disconnect();
      io.disconnect();
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerleave", leave);
      zone.removeEventListener("pointerdown", press);
      zone.removeEventListener("pointerup", release);
      zone.removeEventListener("pointercancel", release);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function Hyperspeed({
  leftColor = "#ff2d78",
  rightColor = "#3ee0ff",
  sideColor = "#c9c3ff",
  speed = 1,
  boost = 4,
  density = 0.6,
  className,
}: HyperspeedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ leftColor, rightColor, sideColor, speed, boost, density });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { leftColor, rightColor, sideColor, speed, boost, density };
    redraw.current?.();
  }, [leftColor, rightColor, sideColor, speed, boost, density]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      (ptr) => opts.current.speed * (1 + ptr.down * (opts.current.boost - 1)),
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uLeft"), rgb(o.leftColor));
        gl.uniform3fv(u("uRight"), rgb(o.rightColor));
        gl.uniform3fv(u("uSide"), rgb(o.sideColor));
        gl.uniform1f(u("uDensity"), o.density);
      },
    );
    redraw.current = r?.redraw;
    return () => r?.dispose();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    />
  );
}
