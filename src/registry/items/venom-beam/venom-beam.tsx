"use client";

import { useEffect, useRef } from "react";

export interface VenomBeamProps {
  /** Glow color around the tendrils. */
  color?: string;
  /** Writhing speed multiplier; 0 freezes the beam. */
  speed?: number;
  /** Tendril detail; higher means tighter twists. */
  scale?: number;
  /** Beam thickness multiplier. */
  width?: number;
  /** Number of tendrils, 1 to 10. */
  tendrils?: number;
  /** Glow brightness. */
  intensity?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uScale;
uniform float uWidth;
uniform float uCount;
uniform float uIntensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float W = 0.085 * uWidth;
  // The whole beam sways slowly.
  float y = p.y - (noise(vec2(p.x * 0.9 - t * 0.15, 3.1)) - 0.5) * 0.14;
  float ay = abs(y);

  // Toxic light behind the tendrils, pulsing as it flows.
  float flow = 0.75 + 0.5 * noise(vec2(p.x * 2.5 - t * 1.6, 7.0));
  vec3 col = vec3(0.003, 0.007, 0.005);
  col += uColor * exp(-ay * ay / (W * W) * 0.9) * 0.9 * flow * uIntensity;
  col += uColor * exp(-ay / (W * 3.5)) * 0.14 * uIntensity;

  float body = 0.0;
  float rim = 0.0;
  float gloss = 0.0;
  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    if (fi >= uCount) break;
    float r = hash(vec2(fi * 1.37, 2.9));
    float fx = p.x * uScale * (1.4 + r * 1.3);
    float off = (fbm(vec2(fx - t * (0.5 + r * 0.5), fi * 4.3 + t * 0.2)) - 0.5) * W * 3.4;
    float th = W * (0.08 + 0.3 * noise(vec2(fx * 1.6 + t * 0.35, fi * 2.7 + 9.0)));
    float d = abs(y - off);
    float m = smoothstep(th, th * 0.55, d);
    body = max(body, m);
    rim += exp(-pow((d - th) / (th * 0.45 + 0.0015), 2.0));
    gloss += exp(-pow((y - off - th * 0.45) / (th * 0.2 + 0.001), 2.0)) * m;
  }

  // Oily, near-black tendrils with a faint inner venom glow.
  float veins = noise(vec2(p.x * 18.0 * uScale - t * 2.0, y * 40.0));
  vec3 flesh = vec3(0.006, 0.012, 0.009) + uColor * (0.03 + 0.06 * veins * veins);
  col = mix(col, flesh, body);
  col += mix(uColor, vec3(1.0), 0.25) * min(rim, 1.6) * (1.0 - body * 0.8) * 0.75 * uIntensity;
  col += mix(uColor, vec3(1.0), 0.6) * min(gloss, 1.0) * 0.28;

  // Drifting venom droplets shed from the beam.
  vec2 g = vec2(p.x * 26.0 - t * 1.2, y * 26.0);
  vec2 id = floor(g);
  float h = hash(id);
  if (h > 0.9) {
    vec2 f = fract(g) - 0.5 - (vec2(hash(id + 4.1), hash(id + 8.3)) - 0.5) * 0.6;
    float drop = exp(-dot(f, f) * 70.0) * (0.5 + 0.5 * sin(t * 3.0 + h * 50.0));
    col += uColor * drop * exp(-ay / (W * 2.5)) * 0.9 * uIntensity;
  }

  col = 1.0 - exp(-col * 1.6);
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 0.9;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Compiles a full-screen-triangle program and returns a cached uniform lookup, or null. */
function fullscreen(gl: WebGLRenderingContext, frag: string) {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const cache = new Map<string, WebGLUniformLocation | null>();
  return (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name));
    return cache.get(name) ?? null;
  };
}

export function VenomBeam({
  color = "#7dff3a",
  speed = 1,
  scale = 1,
  width = 1,
  tendrils = 7,
  intensity = 1,
  className,
}: VenomBeamProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, scale, width, tendrils, intensity });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, speed, scale, width, tendrils, intensity };
    redraw.current?.();
  }, [color, speed, scale, width, tendrils, intensity]);

  useEffect(() => {
    const el = host.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    const u = gl && fullscreen(gl, FRAG);
    if (!gl || !u) {
      canvas.remove();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let time = 12;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.1));
      gl.uniform1f(u("uWidth"), Math.max(o.width, 0.1));
      gl.uniform1f(u("uCount"), Math.min(10, Math.max(1, Math.round(o.tendrils))));
      gl.uniform1f(u("uIntensity"), o.intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    redraw.current = draw;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
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
