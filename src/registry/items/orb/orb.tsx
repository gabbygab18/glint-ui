"use client";

import { useEffect, useRef } from "react";

export interface OrbProps {
  /** Hue rotation in degrees (0–360). */
  hue?: number;
  /** How much the orb warps and brightens on hover (0 disables). */
  hoverIntensity?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Orb size relative to the container's shorter side. */
  size?: number;
  className?: string;
}

const RADIUS = 0.34;

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHue;
uniform float uHover;
uniform float uSize;
uniform vec2 uMouse;

float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
vec3 hueRotate(vec3 c, float a){
  const vec3 k = vec3(0.57735);
  float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
}

void main(){
  float m = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / m / uSize;
  float t = uTime;
  float R = ${RADIUS.toFixed(2)};

  // Organic wobble of the whole shape, stronger while hovered, plus a dent under the cursor.
  float amp = 0.05 + 0.12 * uHover;
  vec2 wob = vec2(n3(vec3(p * 2.4, t * 0.4)), n3(vec3(p * 2.4 + 5.7, t * 0.4))) - 0.5;
  vec2 q = p + wob * amp;
  vec2 dm = p - uMouse;
  q += dm * exp(-dot(dm, dm) * 30.0) * 0.25 * uHover;

  float r = length(q);
  float ang = atan(q.y, q.x);
  float n = n3(vec3(q * 3.2, t * 0.3));

  // Iridescent film: a cosine palette that slides around the rim.
  float k = ang / 6.2831853 + t * 0.06 + n * 0.45;
  vec3 pal = 0.5 + 0.5 * cos(6.2831853 * (k + vec3(0.0, 0.33, 0.67)));
  pal = mix(pal, vec3(0.45, 0.35, 1.0), 0.35);
  pal = hueRotate(pal, uHue * 0.0174533);

  float inside = step(r, R);
  float shell = pow(clamp(r / R, 0.0, 1.0), 3.0) * inside;
  float swirl = n3(vec3(q * 6.0 + vec2(t * 0.2, 0.0), t * 0.5));
  float rim = exp(-abs(r - R) * 38.0);
  float halo = exp(-max(r - R, 0.0) * 9.0) * (1.0 - inside) * 0.35;
  float I = shell * (0.55 + 0.6 * swirl) + rim * 0.9 + halo;
  I *= 1.0 + 0.45 * uHover;

  vec3 col = pal * I + vec3(1.0) * pow(rim, 4.0) * 0.35 * (1.0 + uHover);
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}`;

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

export function Orb({ hue = 0, hoverIntensity = 1, speed = 1, size = 1, className }: OrbProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ hue, hoverIntensity, speed, size });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { hue, hoverIntensity, speed, size };
    redraw.current?.();
  }, [hue, hoverIntensity, speed, size]);

  useEffect(() => {
    const el = host.current!;
    const area = el.parentElement ?? el;
    const mouse = { x: 10, y: 10, over: false };
    let hover = 0;
    let t = 2;
    const shader = mountShader(el, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed * (1 + hover * 0.6);
      hover += ((mouse.over ? 1 : 0) - hover) * (1 - Math.exp(-dt * 4));
      set("uTime", t);
      set("uHue", o.hue);
      set("uHover", hover * o.hoverIntensity);
      set("uSize", Math.max(o.size, 0.1));
      set("uMouse", [mouse.x, mouse.y]);
    });
    if (!shader) return;
    redraw.current = shader.redraw;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const m = Math.min(r.width, r.height) * opts.current.size;
      mouse.x = (e.clientX - r.left - r.width / 2) / m;
      mouse.y = -(e.clientY - r.top - r.height / 2) / m;
      mouse.over = Math.hypot(mouse.x, mouse.y) < RADIUS * 1.1;
    };
    const onLeave = () => {
      mouse.over = false;
    };
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);
    return () => {
      redraw.current = undefined;
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
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
