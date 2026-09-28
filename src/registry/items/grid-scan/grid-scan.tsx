"use client";

import { useEffect, useRef } from "react";

export interface GridScanProps {
  gridColor?: string;
  scanColor?: string;
  /** Grid cells per world unit; higher is denser. */
  density?: number;
  /** Scan sweep speed multiplier. */
  speed?: number;
  /** Thickness of the scanning band. */
  scanWidth?: number;
  /** Overall glow intensity. */
  glow?: number;
  className?: string;
}

const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
float sq(float v) { return v * v; }
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uGrid;
uniform vec3 uScan;
uniform float uDensity;
uniform float uScanWidth;
uniform float uGlow;

float gridLine(vec2 g, float width) {
  vec2 d = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), 1e-4);
  return 1.0 - min(min(d.x, d.y) / width, 1.0);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0) * uHover;
  float horizon = 0.1 + m.y * 0.06;
  p.x -= m.x * 0.18;

  // scan sweeps from the horizon toward the viewer, speeding up as it approaches
  float s = fract(uTime * 0.18 + 0.45);
  float sb = mix(0.0, 0.7, s * s);
  float sw = uScanWidth * 0.3 * sb + 0.006;

  vec3 col = vec3(0.0);
  float below = horizon - p.y;
  if (below > 0.0) {
    float z = 0.32 / below;
    vec2 w = vec2(p.x * z + m.x * 1.2, z) * uDensity * 1.6;
    float band = exp(-sq((below - sb) / sw)) * step(below, sb) + exp(-sq((below - sb) / (sw * 0.2))) * step(sb, below);
    float ahead = exp(-sq((below - sb) / (sw * 0.12)));
    float fog = exp(-z * 0.07);
    float line = gridLine(w, 1.0);
    float halo = gridLine(w, 5.0);
    col += mix(uGrid, uScan, band * 0.6) * (line * (0.7 + 2.5 * band) + halo * 0.12 * (1.0 + 3.0 * band)) * fog;
    col += uScan * band * band * 0.3 * fog;
    col += uScan * (line * 1.6 + 0.35) * ahead * fog;
    col *= smoothstep(0.0, 0.03, below);
  }
  // horizon glow and scan flash when the sweep starts far away
  float hz = exp(-abs(p.y - horizon) * 14.0);
  col += uGrid * hz * 0.35 * uGlow;
  col += uScan * hz * 0.5 * exp(-s * 6.0);
  col += uGrid * 0.06 * exp(-length(vec2(p.x * 0.5, p.y - horizon)) * 3.0);

  col *= uGlow;
  col = 1.0 - exp(-col * 1.2);
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
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
  gl.getExtension("OES_standard_derivatives");
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

export function GridScan({
  gridColor = "#8b5cf6",
  scanColor = "#22d3ee",
  density = 1,
  speed = 1,
  scanWidth = 0.5,
  glow = 1,
  className,
}: GridScanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ gridColor, scanColor, density, speed, scanWidth, glow });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { gridColor, scanColor, density, speed, scanWidth, glow };
    redraw.current?.();
  }, [gridColor, scanColor, density, speed, scanWidth, glow]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uGrid"), rgb(o.gridColor));
        gl.uniform3fv(u("uScan"), rgb(o.scanColor));
        gl.uniform1f(u("uDensity"), Math.max(0.1, o.density));
        gl.uniform1f(u("uScanWidth"), Math.max(0.05, o.scanWidth));
        gl.uniform1f(u("uGlow"), o.glow);
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
