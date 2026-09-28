"use client";

import { useEffect, useRef } from "react";

export interface PixelSnowProps {
  /** Flake color. */
  color?: string;
  /** Fall speed multiplier. */
  speed?: number;
  /** Share of grid cells holding a flake, 0-1. */
  density?: number;
  /** Size of one chunky pixel, in CSS pixels. */
  pixelSize?: number;
  /** Sideways drift; negative blows left. */
  wind?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uPixel;
uniform float uDensity;
uniform float uWind;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  // everything happens on a coarse pixel grid, so flakes step chunk by chunk
  vec2 P = floor(gl_FragCoord.xy / uPixel);
  float light = 0.0;
  for (int i = 0; i < 6; i++) {
    float z = float(i) / 5.0; // 0 = far, 1 = near
    float size = floor(z * 3.0 + 0.2); // flake radius in chunks: 0 0 1 2 2 3
    float cell = 9.0 + size * 7.0 + float(i) * 2.0;
    float fall = mix(2.5, 11.0, z);
    vec2 q = P + vec2(-uWind * fall * 0.8 * uTime, uTime * fall) + float(i) * 37.0;
    vec2 id = floor(q / cell);
    float h = hash(id + float(i) * 13.7);
    if (h < uDensity) {
      float margin = size + 3.0;
      vec2 c = floor(vec2(hash(id + 4.1), hash(id + 9.3)) * (cell - 2.0 * margin)) + margin;
      c.x += floor(sin(uTime * (0.7 + h) + h * 50.0) * 1.8 * (0.5 + z) + 0.5);
      vec2 d = abs(floor(q - id * cell) - c);
      float m = max(d.x, d.y);
      bool arm = d.x < 0.5 || d.y < 0.5 || (size > 1.5 && abs(d.x - d.y) < 0.5);
      if (arm && m < size + 0.5) {
        float tw = 0.8 + 0.2 * sin(uTime * 3.0 + h * 90.0);
        // the tips of big flakes are a touch dimmer, like a soft pixel-art falloff
        float tip = size > 1.5 ? 1.0 - 0.35 * step(size - 0.5, m) : 1.0;
        light = max(light, mix(0.25, 1.0, z * z) * tw * tip);
      }
    }
  }
  gl_FragColor = vec4(uColor * light, light);
}
`;

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

type Ptr = { x: number; y: number; hover: number };
type Uni = (name: string) => WebGLUniformLocation | null;

/** Full-screen shader canvas inside `host`: DPR-capped resize, offscreen pause, reduced motion, eased pointer. */
function runShader(host: HTMLElement, frag: string, speed: () => number, update: (gl: WebGLRenderingContext, u: Uni) => void) {
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
  const ptr: Ptr = { x: 0.5, y: 0.5, hover: 0 };
  const goal: Ptr = { ...ptr };
  let raf = 0;
  let last = 0;
  let time = 0;

  const draw = () => {
    gl.uniform2f(u("uRes"), canvas.width, canvas.height);
    gl.uniform1f(u("uTime"), time);
    gl.uniform2f(u("uMouse"), ptr.x, ptr.y);
    gl.uniform1f(u("uHover"), ptr.hover);
    update(gl, u);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const k = 1 - Math.exp(-dt * 4);
    for (const key of ["x", "y", "hover"] as const) ptr[key] += (goal[key] - ptr[key]) * k;
    time += dt * speed();
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
  };
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([e]) => run(e.isIntersecting));
  ro.observe(host);
  io.observe(host);
  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerleave", leave);
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
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function PixelSnow({
  color = "#ffffff",
  speed = 1,
  density = 0.35,
  pixelSize = 4,
  wind = 0.3,
  className,
}: PixelSnowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, density, pixelSize, wind });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { color, speed, density, pixelSize, wind };
    redraw.current?.();
  }, [color, speed, density, pixelSize, wind]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gl.uniform3fv(u("uColor"), rgb(o.color));
        gl.uniform1f(u("uPixel"), Math.max(1, Math.round(o.pixelSize * dpr)));
        gl.uniform1f(u("uDensity"), o.density);
        gl.uniform1f(u("uWind"), o.wind);
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
