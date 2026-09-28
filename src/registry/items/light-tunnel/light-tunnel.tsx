"use client";

import { useEffect, useRef } from "react";

export interface LightTunnelProps {
  colorA?: string;
  colorB?: string;
  /** Flight speed multiplier. */
  speed?: number;
  /** Rings per unit of depth. */
  density?: number;
  /** Number of lengthwise lines; 0 hides them. */
  lines?: number;
  /** Spiral of the lengthwise lines. */
  twist?: number;
  /** Line glow strength. */
  glow?: number;
  /** The vanishing point drifts toward the cursor. */
  interactive?: boolean;
  className?: string;
}

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDensity;
uniform float uLines;
uniform float uTwist;
uniform float uGlow;
uniform vec2 uCenter;

float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y - uCenter;
  float t = uTime;

  // Bend the tunnel: offset each pixel by a path sampled at its own depth.
  float z0 = 0.35 / max(length(p), 1e-3);
  p -= vec2(sin(z0 * 0.21 + t * 0.35), cos(z0 * 0.17 + t * 0.28)) * 0.035 * min(z0, 12.0) / 12.0;

  float r = max(length(p), 1e-3);
  float a = atan(p.y, p.x);
  float z = 0.35 / r;
  float w = 0.003 * uGlow;

  // Rings: distance to the nearest ring in depth, projected back to screen space.
  float rc = z * uDensity + t * 1.6;
  float fr = fract(rc);
  float sd = min(fr, 1.0 - fr) / uDensity * r * r / 0.35;
  float id = floor(rc + 0.5);
  float pulse = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(t * 2.0 + id * 1.7), 3.0);
  float ring = (exp(-sd / w) + 0.5 * w * 3.0 / (sd + w * 3.0)) * pulse * (0.5 + 0.5 * hash(id));

  // Lengthwise lines with sparks racing along them.
  float line = 0.0;
  if (uLines > 0.5) {
    float la = a / 6.2831853 * uLines + z * uTwist * 0.15;
    float fa = fract(la);
    float da = min(fa, 1.0 - fa) * 6.2831853 / uLines * r;
    float lid = mod(floor(la + 0.5), uLines);
    float spark = pow(fract(-z * 0.12 - t * 0.9 + hash(lid) * 7.0), 12.0);
    line = exp(-da / (w * 0.7)) * (0.15 + spark * 1.6) + 0.07 * w / (da + w);
  }

  float fog = smoothstep(0.0, 0.22, r) * exp(-z * 0.03);
  float mixv = 0.5 + 0.5 * sin(z * 0.4 - t * 0.6);
  vec3 tint = mix(uColorA, uColorB, mixv);
  vec3 col = tint * (ring + line + 0.03) * fog;
  col += mix(uColorB, vec3(1.0), 0.3) * 0.018 / (r + 0.025); // light at the far end
  col += vec3(1.0) * pow(ring * fog, 3.0) * 0.25;
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

export function LightTunnel({
  colorA = "#38bdf8",
  colorB = "#f472b6",
  speed = 1,
  density = 2,
  lines = 16,
  twist = 1,
  glow = 1,
  interactive = true,
  className,
}: LightTunnelProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ a: hexToRgb(colorA), b: hexToRgb(colorB), speed, density, lines, twist, glow, interactive });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { a: hexToRgb(colorA), b: hexToRgb(colorB), speed, density, lines, twist, glow, interactive };
    redraw.current?.();
  }, [colorA, colorB, speed, density, lines, twist, glow, interactive]);

  useEffect(() => {
    const el = host.current!;
    const area = el.parentElement ?? el;
    const c = { x: 0, y: 0, tx: 0, ty: 0 };
    let t = 5;
    const shader = mountShader(el, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      const k = 1 - Math.exp(-dt * 2.5);
      c.x += ((o.interactive ? c.tx : 0) - c.x) * k;
      c.y += ((o.interactive ? c.ty : 0) - c.y) * k;
      set("uTime", t);
      set("uColorA", o.a);
      set("uColorB", o.b);
      set("uDensity", Math.max(o.density, 0.1));
      set("uLines", Math.round(o.lines));
      set("uTwist", o.twist);
      set("uGlow", Math.max(o.glow, 0.05));
      set("uCenter", [c.x, c.y]);
    });
    if (!shader) return;
    redraw.current = shader.redraw;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      c.tx = ((e.clientX - r.left - r.width / 2) / r.height) * 0.25;
      c.ty = (-(e.clientY - r.top - r.height / 2) / r.height) * 0.25;
    };
    const onLeave = () => {
      c.tx = 0;
      c.ty = 0;
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
