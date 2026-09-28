"use client";

import { useEffect, useRef } from "react";

export interface PrismProps {
  /** Color of the incoming light beam. */
  beamColor?: string;
  /** Rotation speed multiplier. */
  speed?: number;
  /** Prism size, as a fraction of the container height. */
  size?: number;
  /** Width of the rainbow fan, in radians. */
  spread?: number;
  /** Brightness. */
  intensity?: number;
  /** Aim the incoming beam from the cursor when it is left of the prism. */
  followMouse?: boolean;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uBeam;
uniform float uSize;
uniform float uSpread;
uniform float uIntensity;
uniform float uFollow;

const float PI = 3.14159265;

// signed distance to an equilateral triangle pointing up
float sdTri(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

vec3 spectrum(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

float wrap(float a) { return mod(a + PI, 2.0 * PI) - PI; }

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5);
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  float px = 1.0 / uRes.y;
  float t = uTime;
  float rot = t * 0.12;
  float r = length(p);
  float ang = atan(p.y, p.x);

  // incoming beam direction (angle of travel); optionally aimed from the cursor
  float inAng = 0.2 + 0.05 * sin(t * 0.4);
  float aim = uFollow * uHover * step(m.x, -uSize);
  inAng = mix(inAng, atan(-m.y, -m.x), aim);
  vec2 dIn = vec2(cos(inAng), sin(inAng));

  // deviation swings with the prism orientation (period 120 degrees)
  float dev = 0.55 + 0.22 * sin(3.0 * rot);
  float fa = inAng - dev;

  vec3 col = vec3(0.0);

  // white beam: from far left to the prism center
  float along = dot(p, dIn);
  float perp = abs(p.x * dIn.y - p.y * dIn.x);
  float bw = 0.006 + 0.004 * uSize;
  float inBeam = (exp(-perp * perp / (bw * bw)) + 0.25 * exp(-perp * 40.0)) * (1.0 - smoothstep(-0.06, 0.02, along));
  col += uBeam * inBeam * 1.1;

  // rainbow fan leaving the prism
  float h = wrap(ang - fa) / uSpread + 0.5;
  float fan = smoothstep(0.0, 0.06, h) * (1.0 - smoothstep(0.94, 1.0, h));
  float shimmer = 0.82 + 0.18 * sin(h * 40.0 - r * 6.0 + t * 1.6);
  float reach = smoothstep(0.0, uSize * 0.8, r) * exp(-r * 0.7);
  // the fan opens up; keep total energy roughly constant with distance
  col += spectrum((1.0 - clamp(h, 0.0, 1.0)) * 0.78) * fan * shimmer * reach * 0.95;

  // glass body
  float c = cos(rot), s = sin(rot);
  vec2 lp = mat2(c, -s, s, c) * p;
  float d = sdTri(lp, uSize);
  float inside = (1.0 - smoothstep(-px, px, d));
  float rim = exp(-abs(d) / (1.6 * px));
  float glint = pow(0.5 + 0.5 * sin(atan(lp.y, lp.x) * 3.0 - t * 0.9), 6.0);
  col = mix(col, col * 0.55 + vec3(0.06, 0.07, 0.09), inside);
  col += inside * spectrum(fract(dot(p, vec2(0.7, -0.7)) * 1.5 + t * 0.05) * 0.8) * 0.06;
  col += vec3(0.85, 0.9, 1.0) * rim * (0.35 + 0.65 * glint);
  col += vec3(0.8, 0.85, 1.0) * exp(-abs(d) / (14.0 * px)) * 0.08;

  // hot spot where light enters the glass
  col += uBeam * 0.012 / (r + 0.012) * 0.5;

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

export function Prism({
  beamColor = "#ffffff",
  speed = 1,
  size = 0.2,
  spread = 0.5,
  intensity = 1,
  followMouse = true,
  className,
}: PrismProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ beamColor, speed, size, spread, intensity, followMouse });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { beamColor, speed, size, spread, intensity, followMouse };
    redraw.current?.();
  }, [beamColor, speed, size, spread, intensity, followMouse]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform3fv(u("uBeam"), rgb(o.beamColor));
        gl.uniform1f(u("uSize"), Math.max(0.02, o.size));
        gl.uniform1f(u("uSpread"), Math.max(0.05, o.spread));
        gl.uniform1f(u("uIntensity"), o.intensity);
        gl.uniform1f(u("uFollow"), o.followMouse ? 1 : 0);
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
