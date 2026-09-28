"use client";

import { useEffect, useRef } from "react";

export interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  /** Pillar width as a fraction of the container height. */
  width?: number;
  intensity?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** How strongly the inner smoke swirls around the axis. */
  twist?: number;
  /** Rotation of the pillar in degrees. */
  angle?: number;
  className?: string;
}

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uWidth;
uniform float uIntensity;
uniform float uTwist;
uniform float uAngle;

float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){ return n3(p) * 0.55 + n3(p * 2.03 + 7.1) * 0.3 + n3(p * 4.1 + 3.3) * 0.15; }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float c = cos(uAngle), s = sin(uAngle);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  float t = uTime;
  float R = uWidth * 0.5;
  float ax = abs(p.x);

  // March through the cylinder along the view ray and gather swirling smoke.
  float dens = 0.0;
  if (ax < R) {
    float hz = sqrt(R * R - p.x * p.x);
    for (int i = 0; i < 14; i++) {
      float z = mix(-hz, hz, (float(i) + 0.5) / 14.0);
      float a = t * 0.5 + p.y * uTwist;
      float ca = cos(a), sa = sin(a);
      vec3 q = vec3(ca * p.x - sa * z, p.y, sa * p.x + ca * z) / R;
      q.y = q.y * 0.35 - t * 0.35;
      float n = fbm(q * 2.2);
      dens += smoothstep(0.38, 0.82, n);
    }
    dens /= 14.0;
    float e = hz * hz / (R * R);
    dens *= e * e; // fade smoothly to nothing at the rim
  }

  float x = ax / R;
  float core = exp(-x * x * 8.0) * 0.6 + exp(-x * x * 90.0) * 0.7;
  float halo = exp(-x * 1.6) * 0.35 + exp(-x * 0.55) * 0.08;
  float ends = smoothstep(0.62, 0.05, abs(p.y)) * 0.6 + 0.4;
  float I = (dens * 2.2 + core * 0.6 + halo) * ends * uIntensity;

  float g = clamp(p.y + 0.5 + (dens - 0.3) * 0.25, 0.0, 1.0);
  vec3 tint = mix(uBottom, uTop, smoothstep(0.0, 1.0, g));
  vec3 col = tint * I + vec3(1.0) * pow(core * dens * uIntensity, 2.0) * 0.6;
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
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

export function LightPillar({
  topColor = "#a78bfa",
  bottomColor = "#22d3ee",
  width = 0.32,
  intensity = 1,
  speed = 1,
  twist = 2.5,
  angle = 0,
  className,
}: LightPillarProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ top: hexToRgb(topColor), bottom: hexToRgb(bottomColor), width, intensity, speed, twist, angle });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { top: hexToRgb(topColor), bottom: hexToRgb(bottomColor), width, intensity, speed, twist, angle };
    redraw.current?.();
  }, [topColor, bottomColor, width, intensity, speed, twist, angle]);

  useEffect(() => {
    let t = 3;
    const shader = mountShader(host.current!, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      set("uTime", t);
      set("uTop", o.top);
      set("uBottom", o.bottom);
      set("uWidth", Math.max(o.width, 0.02));
      set("uIntensity", o.intensity);
      set("uTwist", o.twist);
      set("uAngle", (o.angle * Math.PI) / 180);
    });
    if (!shader) return;
    redraw.current = shader.redraw;
    return () => {
      redraw.current = undefined;
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
