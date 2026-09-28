"use client";

import { useEffect, useRef } from "react";

export type ScannerDirection = "vertical" | "horizontal";

export interface ScannerProps {
  /** Scan line and texture color. */
  color?: string;
  /** Sweep speed multiplier. */
  speed?: number;
  /** "vertical" sweeps a horizontal line up and down; "horizontal" sweeps left and right. */
  direction?: ScannerDirection;
  /** Dot grid spacing in CSS pixels. */
  cellSize?: number;
  /** Length of the afterglow behind the line. */
  trail?: number;
  /** Brightness. */
  intensity?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uCell;
uniform float uTrail;
uniform float uIntensity;
uniform float uVertical;
uniform float uDpr;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float L = mix(uRes.x, uRes.y, uVertical);
  float s = mix(fc.x, fc.y, uVertical);
  float ph = uTime * 0.6 + 1.3;

  // eased back-and-forth sweep; trail stretches with the line's speed
  float lineS = mix(0.04, 0.96, 0.5 - 0.5 * cos(ph)) * L;
  float vel = sin(ph);
  float dir = vel >= 0.0 ? 1.0 : -1.0;
  float ds = s - lineS;
  float behind = -ds * dir;
  float len = L * 0.3 * uTrail * (0.12 + 0.88 * abs(vel)) + 1.0;
  float trail = behind > 0.0 ? exp(-behind / len) : exp(behind / (4.0 * uDpr));
  float core = exp(-abs(ds) / (1.2 * uDpr));
  float bloom = exp(-abs(ds) / (22.0 * uDpr));

  // texture: dot grid with faint cell lines
  vec2 g = fc / uCell;
  vec2 f = abs(fract(g) - 0.5) * uCell;
  float rnd = hash(floor(g));
  float dotM = 1.0 - smoothstep(0.7 * uDpr, 1.7 * uDpr, length(f));
  float edge = 0.5 * uCell - max(f.x, f.y);
  float grid = 1.0 - smoothstep(0.0, 1.0 * uDpr, edge);
  float tex = dotM * (0.55 + 0.45 * rnd) + grid * 0.18;
  // a few cells flare when the line crosses them
  float flare = step(0.93, rnd) * exp(-abs(ds) / (uCell * 1.5)) * (1.0 - smoothstep(0.0, uCell * 0.45, max(f.x, f.y)));

  float lit = trail * 0.9 + bloom * 0.6;
  vec3 col = uColor * (tex * (0.2 + lit * 1.3) + flare * 0.35 + bloom * 0.12 + trail * 0.05 + core * 1.1);
  col += vec3(1.0) * core * 0.7;
  col = 1.0 - exp(-col * uIntensity * 1.2);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
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

export function Scanner({
  color = "#22d3ee",
  speed = 1,
  direction = "vertical",
  cellSize = 18,
  trail = 1,
  intensity = 1,
  className,
}: ScannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, direction, cellSize, trail, intensity });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { color, speed, direction, cellSize, trail, intensity };
    redraw.current?.();
  }, [color, speed, direction, cellSize, trail, intensity]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gl.uniform3fv(u("uColor"), rgb(o.color));
        gl.uniform1f(u("uCell"), Math.max(4, o.cellSize) * dpr);
        gl.uniform1f(u("uTrail"), Math.max(0.05, o.trail));
        gl.uniform1f(u("uIntensity"), o.intensity);
        gl.uniform1f(u("uVertical"), o.direction === "horizontal" ? 0 : 1);
        gl.uniform1f(u("uDpr"), dpr);
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
