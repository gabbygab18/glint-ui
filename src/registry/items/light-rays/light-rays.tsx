"use client";

import { useEffect, useRef } from "react";

export type LightRaysOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "left"
  | "right"
  | "bottom-center"
  | "center";

export interface LightRaysProps {
  /** Where the rays come from. */
  origin?: LightRaysOrigin;
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Cone half-width in radians (ignored for "center"). */
  spread?: number;
  /** How far the rays reach, in container heights. */
  length?: number;
  intensity?: number;
  /** 0–1, how much the beam leans toward the cursor. */
  followMouse?: number;
  className?: string;
}

// Origin (uv, y up) and main direction for each preset. Sources sit just offscreen.
const ORIGINS: Record<LightRaysOrigin, [number, number, number, number]> = {
  "top-center": [0.5, 1.12, 0, -1],
  "top-left": [-0.04, 1.08, 0.75, -0.66],
  "top-right": [1.04, 1.08, -0.75, -0.66],
  left: [-0.08, 0.5, 1, 0],
  right: [1.08, 0.5, -1, 0],
  "bottom-center": [0.5, -0.12, 0, 1],
  center: [0.5, 0.5, 0, 1],
};

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform vec4 uOrigin;
uniform float uSpread;
uniform float uLength;
uniform float uIntensity;
uniform float uFollow;
uniform vec2 uMouse;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
// Integer angular frequencies keep the pattern seamless all the way around.
float streak(float a, float k, float ph, float sharp){ return pow(0.5 + 0.5 * sin(a * k + ph), sharp); }

void main(){
  float asp = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y;
  vec2 o = uOrigin.xy * vec2(asp, 1.0);
  vec2 m = uMouse * vec2(asp, 1.0);
  float t = uTime;

  vec2 d = p - o;
  float dist = length(d);
  vec2 nd = d / max(dist, 1e-4);

  // Main direction leans toward the cursor and sways gently.
  vec2 dir = normalize(mix(uOrigin.zw, normalize(m - o + 1e-4), uFollow * 0.35));
  float sway = sin(t * 0.37) * 0.05 + sin(t * 0.21 + 1.7) * 0.035;
  float a = atan(nd.y, nd.x) + sway;

  float s = streak(a, 7.0, -t * 0.31, 2.0) * 0.35
          + streak(a, 13.0, t * 0.53, 4.0) * 0.55
          + streak(a, 23.0, -t * 0.47 + 1.3, 6.0) * 0.45
          + streak(a, 37.0, t * 0.71 + 4.0, 9.0) * 0.35
          + streak(a, 61.0, -t * 0.9 + 2.2, 12.0) * 0.2;
  s *= 0.55 + 0.9 * noise(nd * 2.5 + vec2(t * 0.07, -t * 0.05));

  float cosA = clamp(dot(nd, dir), -1.0, 1.0);
  float ang = acos(cosA);
  float cone = exp(-ang * ang / (uSpread * uSpread));

  float fall = exp(-dist / uLength);
  float shimmer = 0.8 + 0.2 * noise(vec2(dist * 5.0 - t * 1.2, a * 9.0));
  float I = s * cone * fall * shimmer;
  I += exp(-dist * dist * 9.0) * 0.45 * cone; // bloom near the source
  I *= uIntensity;

  vec3 col = uColor * I + vec3(pow(I, 3.0)) * 0.35;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0; // dither against banding
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

export function LightRays({
  origin = "top-center",
  color = "#d9f0ff",
  speed = 1,
  spread = 0.6,
  length = 1.2,
  intensity = 1,
  followMouse = 0.4,
  className,
}: LightRaysProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ origin, color: hexToRgb(color), speed, spread, length, intensity, followMouse });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { origin, color: hexToRgb(color), speed, spread, length, intensity, followMouse };
    redraw.current?.();
  }, [origin, color, speed, spread, length, intensity, followMouse]);

  useEffect(() => {
    const el = host.current!;
    const area = el.parentElement ?? el;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let t = 4;
    const shader = mountShader(el, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      const k = 1 - Math.exp(-dt * 3);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      set("uTime", t);
      set("uColor", o.color);
      set("uOrigin", ORIGINS[o.origin] ?? ORIGINS["top-center"]);
      set("uSpread", o.origin === "center" ? 100 : Math.max(o.spread, 0.01));
      set("uLength", Math.max(o.length, 0.05));
      set("uIntensity", o.intensity);
      set("uFollow", o.origin === "center" ? 0 : o.followMouse);
      set("uMouse", [mouse.x, mouse.y]);
    });
    if (!shader) return;
    redraw.current = shader.redraw;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      mouse.tx = 0.5;
      mouse.ty = 0.5;
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
