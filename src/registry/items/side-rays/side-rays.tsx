"use client";

import { useEffect, useRef } from "react";

export interface SideRaysProps {
  /** Light color. */
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Which edge the light enters from. */
  side?: "left" | "right";
  /** Downward tilt of the rays, in radians. */
  angle?: number;
  /** Number of blind slats across the container height. */
  slats?: number;
  /** Brightness. */
  intensity?: number;
  /** Amount of floating dust, 0-1. */
  dust?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uSide;
uniform float uAngle;
uniform float uSlats;
uniform float uIntensity;
uniform float uDust;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  if (uSide > 0.5) uv.x = 1.0 - uv.x;
  vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
  float t = uTime;

  float ang = uAngle + 0.025 * sin(t * 0.3);
  vec2 nrm = vec2(sin(ang), cos(ang));
  float u = dot(p, nrm) + 0.1;              // position across the beams
  float dist = p.x / cos(ang);              // distance travelled from the window

  // blinds: soft-edged slats whose openings breathe slowly; penumbra widens with distance
  float s = u * uSlats;
  float id = floor(s);
  float f = fract(s);
  float open = 0.22 + 0.3 * noise(vec2(id * 1.7, t * 0.2));
  float soft = 0.04 + dist * 0.16;
  float lo = 0.5 - open * 0.5, hi = 0.5 + open * 0.5;
  float beam = smoothstep(lo - soft, lo + soft, f) * (1.0 - smoothstep(hi - soft, hi + soft, f));
  beam *= 0.75 + 0.25 * noise(vec2(id * 3.1, t * 0.6));
  beam *= 0.8 + 0.2 * noise(vec2(u * 70.0, dist * 1.5 - t * 0.15));

  float fall = exp(-dist * 1.1) * smoothstep(0.28, 0.5, u) * (1.0 - smoothstep(1.0, 1.25, u));
  float light = beam * fall * 0.75 + exp(-dist * 1.8) * 0.08 * fall;

  // dust motes, only visible where the light hits them
  float dust = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float sc = 14.0 + fi * 9.0;
    vec2 q = p * sc + vec2(t * (0.25 + fi * 0.1), t * 0.12 * (fi - 1.0) + sin(t * 0.2 + fi) * 0.6);
    vec2 cid = floor(q);
    float h = hash(cid + fi * 17.0);
    if (h < 0.35 * uDust) {
      vec2 pos = vec2(hash(cid + 3.3), hash(cid + 8.8)) - 0.5;
      pos *= 0.6;
      pos += 0.12 * vec2(sin(t * 0.7 + h * 40.0), cos(t * 0.5 + h * 60.0));
      float d = length(fract(q) - 0.5 - pos);
      float tw = 0.5 + 0.5 * sin(t * 1.8 + h * 90.0);
      dust += (1.0 - smoothstep(0.0, 0.07, d)) * (0.4 + 0.6 * tw) * (1.0 - fi * 0.25);
    }
  }
  float motes = dust * (beam * fall * 2.0 + 0.04);

  vec3 col = uColor * light * 0.9 + mix(uColor, vec3(1.0), 0.5) * motes;
  col = 1.0 - exp(-col * uIntensity * 1.3);
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

export function SideRays({
  color = "#ffe2b8",
  speed = 1,
  side = "left",
  angle = 0.35,
  slats = 7,
  intensity = 1,
  dust = 0.6,
  className,
}: SideRaysProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, side, angle, slats, intensity, dust });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { color, speed, side, angle, slats, intensity, dust };
    redraw.current?.();
  }, [color, speed, side, angle, slats, intensity, dust]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uColor"), rgb(o.color));
        gl.uniform1f(u("uSide"), o.side === "right" ? 1 : 0);
        gl.uniform1f(u("uAngle"), Math.max(-1.2, Math.min(1.2, o.angle)));
        gl.uniform1f(u("uSlats"), Math.max(1, o.slats));
        gl.uniform1f(u("uIntensity"), o.intensity);
        gl.uniform1f(u("uDust"), o.dust);
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
