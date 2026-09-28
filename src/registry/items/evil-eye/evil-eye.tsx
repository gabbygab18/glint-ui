"use client";

import { useEffect, useRef } from "react";

export interface EvilEyeProps {
  /** Glow color of the iris and halo. */
  color?: string;
  /** Eye size multiplier. */
  scale?: number;
  /** Iris churn speed multiplier; 0 freezes it. */
  speed?: number;
  /** Blink every few seconds. */
  blink?: boolean;
  /** The pupil follows the cursor. */
  follow?: boolean;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLook;
uniform float uOpen;
uniform vec3 uColor;
uniform float uScale;

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
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y / uScale;
  float px = 1.5 / uRes.y / uScale;
  float t = uTime;

  // Almond: the intersection of two large circles. Blinking flattens it.
  float W = 0.6;
  float H = max(0.27 * uOpen, 0.003);
  float c = (W * W - H * H) / (2.0 * H);
  float R = c + H;
  float dUp = length(p - vec2(0.0, -c)) - R;
  float dLo = length(p - vec2(0.0, c)) - R;
  float dEye = max(dUp, dLo);

  // Iris, shifted toward the cursor.
  vec2 ic = uLook * vec2(0.26, 0.09);
  float ri = 0.235;
  vec2 ip = p - ic;
  float ir = length(ip) / ri;
  vec2 dir = ip / max(length(ip), 1e-4);

  float fib = fbm(dir * 4.0 + vec2(ir * 1.6 - t * 0.25));
  fib = 0.55 * fib + 0.45 * fbm(dir * 13.0 + vec2(ir * 2.5 + t * 0.12, -ir));
  vec3 hot = mix(uColor, vec3(1.0, 0.95, 0.75), 0.65);
  vec3 iris = mix(hot, uColor, smoothstep(0.2, 0.6, ir));
  iris = mix(iris, uColor * 0.2, smoothstep(0.6, 1.0, ir));
  iris *= 0.45 + 1.1 * fib;

  // Slit pupil that breathes a little.
  float dil = 0.15 + 0.035 * sin(t * 0.6);
  float pd = length((ip / ri) / vec2(dil, 0.78));
  float pupil = smoothstep(1.0 + px * 12.0, 1.0 - px * 12.0, pd);
  iris += hot * exp(-max(pd - 1.0, 0.0) * 5.0) * 0.5 * (1.0 - pupil);
  iris *= smoothstep(1.03, 0.86, ir);
  iris = mix(iris, vec3(0.0), pupil);
  float irisMask = smoothstep(1.0 + px / ri, 1.0 - px / ri, ir);

  // Dark, veined sclera.
  float veins = smoothstep(0.018, 0.0, abs(fbm(p * vec2(4.0, 9.0) + 3.0) - 0.5)) * smoothstep(0.12, 0.5, abs(p.x));
  vec3 sclera = mix(vec3(0.05, 0.012, 0.012), uColor * 0.16, smoothstep(0.65, 0.0, length(p)));
  sclera += uColor * veins * 0.22;
  vec3 eye = mix(sclera, iris, irisMask);

  // Lid shadow and wet highlights.
  eye *= mix(0.25, 1.0, smoothstep(0.0, 0.1, -dUp));
  eye *= mix(0.6, 1.0, smoothstep(0.0, 0.05, -dLo));
  vec2 hl = p - ic - vec2(-0.075, 0.08);
  eye += vec3(1.0) * 0.75 * smoothstep(0.03, 0.012, length(hl * vec2(1.0, 1.4)));
  eye += vec3(1.0) * 0.25 * smoothstep(0.018, 0.006, length(p - ic - vec2(0.07, -0.07)));

  float inside = smoothstep(px, -px, dEye);

  // Smoky dark surroundings, a halo and a burning lid line.
  vec3 bg = vec3(0.012, 0.006, 0.008);
  bg += uColor * 0.07 * fbm(p * 2.5 + vec2(t * 0.05, -t * 0.03)) * (1.0 - smoothstep(0.2, 1.2, length(p)));
  float halo = exp(-max(dEye, 0.0) * 7.0);
  bg += uColor * halo * (0.28 + 0.2 * uOpen);
  vec3 col = mix(bg, eye, inside);
  col += mix(uColor, vec3(1.0, 0.9, 0.7), 0.3) * exp(-abs(dEye) / (px * 3.0)) * 0.7;

  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(v, v) * 1.2;
  gl_FragColor = vec4(col, 1.0);
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

export function EvilEye({
  color = "#ff4d1a",
  scale = 1,
  speed = 1,
  blink = true,
  follow = true,
  className,
}: EvilEyeProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, scale, speed, blink, follow });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, scale, speed, blink, follow };
    redraw.current?.();
  }, [color, scale, speed, blink, follow]);

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
    // look: smoothed gaze in [-1, 1]; target is set from the pointer.
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let visible = true;
    let time = 3;
    let clock = 0;
    let last = 0;
    let open = 1;
    let nextBlink = 2.5;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uLook"), o.follow ? look.x : 0, o.follow ? look.y : 0);
      gl.uniform1f(u("uOpen"), open);
      gl.uniform3fv(u("uColor"), rgb(o.color));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      time += dt * opts.current.speed;
      clock += dt;
      look.x += (look.tx - look.x) * 0.08;
      look.y += (look.ty - look.y) * 0.08;
      // Blink: a quick close and a slightly slower open, every 3 to 7 seconds.
      const b = clock - nextBlink;
      if (!opts.current.blink || b < 0) open = 1;
      else if (b < 0.09) open = 1 - b / 0.09;
      else if (b < 0.3) open = (b - 0.09) / 0.21;
      else {
        open = 1;
        nextBlink = clock + 3 + Math.random() * 4;
      }
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
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = 1 - ((e.clientY - r.top) / r.height) * 2;
      const len = Math.hypot(x, y);
      look.tx = len > 1 ? x / len : x;
      look.ty = len > 1 ? y / len : y;
    };
    const onLeave = () => {
      look.tx = 0;
      look.ty = 0;
    };

    const target = el.parentElement ?? el;
    target.addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("pointerleave", onLeave);
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
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
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
