"use client";

import { useEffect, useRef } from "react";

export interface LuminescentFlowsProps {
  /** First current color. */
  colorA?: string;
  /** Second current color; each strand drifts between the two. */
  colorB?: string;
  /** Number of glowing currents, 1 to 12. */
  count?: number;
  /** Flow speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Size of the curves; higher means broader sweeps. */
  scale?: number;
  /** Overall brightness. */
  intensity?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform float uCount;
uniform float uScale;
uniform float uIntensity;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y / uScale;
  float t = uTime;
  // Gentle domain warp so the currents never look like pure sines.
  p.y += 0.035 * sin(p.x * 2.3 + t * 0.21);
  p.x += 0.03 * sin(p.y * 3.1 - t * 0.17);

  vec3 col = vec3(0.004, 0.01, 0.022);
  float n = max(uCount, 1.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    if (fi >= n) break;
    float k = n > 1.0 ? fi / (n - 1.0) - 0.5 : 0.0;
    float r = fract(sin(fi * 91.7) * 43758.5);
    float y = k * 0.42
      + 0.22 * sin(p.x * (1.1 + r * 0.6) + t * (0.28 + r * 0.2) + fi * 1.7)
      + 0.09 * sin(p.x * (2.7 + r) - t * (0.43 + r * 0.3) + fi * 2.9)
      + 0.035 * sin(p.x * 6.3 + t * 0.9 + fi * 4.1);
    float d = abs(p.y - y);
    float width = 0.0016 + 0.0014 * (0.5 + 0.5 * sin(p.x * 2.4 - t * 0.6 + fi * 3.0));
    float line = width / (d + 0.0025);
    // Bright pulses travel along each current.
    float pulse = pow(0.5 + 0.5 * sin(p.x * 3.2 - t * (1.1 + r * 0.9) + fi * 5.3), 8.0);
    vec3 c = mix(uA, uB, 0.5 + 0.5 * sin(fi * 1.9 + p.x * 0.9 + t * 0.15));
    col += c * line * (0.22 + 0.9 * pulse);
    col += c * exp(-d * d * 180.0) * (0.035 + 0.06 * pulse);
  }

  // Drifting plankton specks that glow near the currents.
  vec2 g = (p + vec2(t * 0.015, sin(t * 0.1) * 0.02)) * 55.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  if (h > 0.93) {
    vec2 o = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
    float s = exp(-dot(f - o * 0.6, f - o * 0.6) * 90.0);
    float tw = 0.5 + 0.5 * sin(t * (1.5 + h * 3.0) + h * 40.0);
    col += mix(uA, uB, hash(id + 1.3)) * s * tw * 0.55;
  }

  col = 1.0 - exp(-col * uIntensity * 1.4);
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 1.1;
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

export function LuminescentFlows({
  colorA = "#2dd4bf",
  colorB = "#818cf8",
  count = 7,
  speed = 1,
  scale = 1,
  intensity = 1,
  className,
}: LuminescentFlowsProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colorA, colorB, count, speed, scale, intensity });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colorA, colorB, count, speed, scale, intensity };
    redraw.current?.();
  }, [colorA, colorB, count, speed, scale, intensity]);

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
    let time = 30;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uA"), rgb(o.colorA));
      gl.uniform3fv(u("uB"), rgb(o.colorB));
      gl.uniform1f(u("uCount"), Math.min(12, Math.max(1, Math.round(o.count))));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.1));
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
