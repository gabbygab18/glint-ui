"use client";

import { useEffect, useRef } from "react";

export interface GalaxyProps {
  /** Base hue of the spiral arms, degrees 0-360. The core gets the complementary warm tone. */
  hue?: number;
  /** Star density multiplier. */
  density?: number;
  /** Number of spiral arms. */
  arms?: number;
  /** Rotation and twinkle speed multiplier. */
  speed?: number;
  /** 0 = steady stars, 1 = full twinkle. */
  twinkle?: number;
  /** Zoom; above 1 makes the galaxy bigger. */
  scale?: number;
  /** How far star layers shift with the cursor. */
  parallax?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uHue;
uniform float uDensity;
uniform float uArms;
uniform float uTwinkle;
uniform float uScale;
uniform float uParallax;

const float TILT = 0.55;

float h21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}
vec3 hsv(float h, float s, float v) {
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return v * mix(vec3(1.0), k, s);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// screen -> galaxy disk (tilted, spinning)
vec2 disk(vec2 p) {
  p = rot(0.45) * p;
  p.y /= TILT;
  return rot(uTime * 0.035) * p;
}
float arms(vec2 d) {
  float r = length(d) + 1e-4;
  float a = atan(d.y, d.x);
  return pow(0.5 + 0.5 * cos(floor(uArms) * a - log(r) * 5.0), 3.0);
}
float density(vec2 d) {
  float r = length(d);
  return exp(-r * 2.2) * (0.06 + 0.94 * arms(d)) + exp(-r * r * 40.0) * 0.8 + 0.03;
}

vec3 stars(vec2 sp, float scale, float seed, float bright) {
  vec2 g = disk(sp) * scale;
  vec2 id = floor(g), f = fract(g);
  float h = h21(id + seed);
  vec2 pos = vec2(h21(id + seed + 7.1), h21(id + seed + 3.7)) * 0.7 + 0.15;
  vec2 wp = (id + pos) / scale;
  if (h > density(wp) * uDensity * 1.4) return vec3(0.0);
  // back to screen space for a round star
  vec2 dd = rot(-uTime * 0.035) * ((pos - f) / scale);
  dd.y *= TILT;
  float dpx = length(dd) * uRes.y;
  float b = pow(fract(h * 91.7), 5.0);
  float s = (0.7 + 2.4 * b) * bright;
  float tw = mix(1.0, 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.2 + 3.0 * fract(h * 13.3)) + h * 40.0)), uTwinkle);
  float cell = uRes.y * TILT / (scale * uScale);
  float I = exp(-dpx * dpx / (s * s)) + b * 0.6 * exp(-dpx / (s * 2.5)) * smoothstep(cell * 0.15, cell * 0.04, dpx);
  float r = length(wp);
  vec3 c = hsv(uHue + (fract(h * 5.3) - 0.5) * 0.1 + 0.45 * exp(-r * 5.0), 0.15 + 0.35 * fract(h * 3.1), 1.0);
  return c * I * tw * (0.55 + 0.45 * b);
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 p = (gl_FragCoord.xy / uRes.y - vec2(0.5 * asp, 0.5)) / uScale;
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0) * uHover * uParallax * 0.04;

  // diffuse light: arms, dust, bulge, core
  vec2 d = disk(p + m * 0.5);
  float r = length(d);
  float n = fbm(d * 3.2 + 7.0);
  float arm = arms(d + (n - 0.5) * 0.08);
  vec3 col = hsv(uHue, 0.7, 1.0) * arm * exp(-r * 2.6) * (0.2 + 1.1 * n * n) * 0.8;
  col += hsv(uHue + 0.08, 0.75, 1.0) * pow(n, 3.0) * arm * exp(-r * 1.5) * 0.5;
  col += hsv(uHue + 0.45, 0.45, 1.0) * exp(-r * r * 38.0) * 0.6;
  col += vec3(1.0, 0.96, 0.9) * exp(-r * r * 160.0) * 0.9;

  col += stars(p + m * 0.3, 7.0, 1.0, 1.3);
  col += stars(p + m * 0.6, 15.0, 17.0, 1.0);
  col += stars(p + m * 1.0, 30.0, 41.0, 0.85);
  col += stars(p + m * 1.5, 55.0, 73.0, 0.7);

  col = 1.0 - exp(-col * 1.4);
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, a);
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

export function Galaxy({
  hue = 225,
  density = 1,
  arms = 2,
  speed = 1,
  twinkle = 0.6,
  scale = 1,
  parallax = 1,
  className,
}: GalaxyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ hue, density, arms, speed, twinkle, scale, parallax });
  const redraw = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    opts.current = { hue, density, arms, speed, twinkle, scale, parallax };
    redraw.current?.();
  }, [hue, density, arms, speed, twinkle, scale, parallax]);

  useEffect(() => {
    const r = runShader(
      ref.current!,
      FRAG,
      () => opts.current.speed,
      (gl, u) => {
        const o = opts.current;
        gl.uniform1f(u("uHue"), (((o.hue % 360) + 360) % 360) / 360);
        gl.uniform1f(u("uDensity"), o.density);
        gl.uniform1f(u("uArms"), Math.max(1, o.arms));
        gl.uniform1f(u("uTwinkle"), o.twinkle);
        gl.uniform1f(u("uScale"), Math.max(0.1, o.scale));
        gl.uniform1f(u("uParallax"), o.parallax);
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
