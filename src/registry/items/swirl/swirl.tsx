"use client";

import { useEffect, useRef } from "react";

export interface SwirlProps {
  /** First paint color. */
  color1?: string;
  /** Second paint color. */
  color2?: string;
  /** Ink color that outlines the swirls. */
  color3?: string;
  /** Flow speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Zoom; higher means larger swirls. */
  scale?: number;
  /** Strength of the spiral twist around the center. */
  twist?: number;
  /** Render in chunky pixels. */
  pixelated?: boolean;
  /** Pixel size in px when pixelated. */
  pixelSize?: number;
  className?: string;
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uScale;
uniform float uTwist;
uniform float uPixel;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  if (uPixel > 1.0) frag = (floor(frag / uPixel) + 0.5) * uPixel;
  vec2 p = (frag - 0.5 * uRes) / uRes.y * 4.0 / uScale;
  float t = uTime * 0.35;

  // Spiral twist: the rotation grows with distance, slowly winding over time.
  float r = length(p);
  p = rot(uTwist * r * 0.55 - t * 0.35) * p;

  // Stir the paint: repeated sine displacements fold the domain onto itself.
  vec2 q = p * 1.5;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    q += 0.85 * vec2(sin(q.y * 1.25 + t + fi * 1.13), cos(q.x * 1.1 - t * 0.85 + fi * 1.71)) / (1.0 + fi * 0.45);
    q = rot(0.35) * q;
  }

  float f = 0.5 + 0.5 * sin(q.x * 1.2 + q.y * 0.9 + t * 0.5);
  float g = 0.5 + 0.5 * sin(length(q) * 1.15 - t * 0.7);

  vec3 col = mix(uC0, uC1, smoothstep(0.47, 0.53, f));
  // Dark ink where the two paints meet, plus fainter secondary veins.
  float fi = (f - 0.5) * 12.0;
  float ink = exp(-fi * fi * fi * fi);
  float gi = (g - 0.5) * 16.0;
  float vein = exp(-gi * gi * gi * gi) * 0.5;
  col = mix(col, uC2, clamp(ink * 0.9 + vein, 0.0, 1.0));
  // Glossy body: lighter crests, deeper troughs.
  col *= 0.78 + 0.4 * g;
  col += 0.12 * pow(g, 10.0) * (1.0 - ink);

  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(v, v) * 0.9;
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

export function Swirl({
  color1 = "#ff4b3e",
  color2 = "#1f7ae0",
  color3 = "#0f1a24",
  speed = 1,
  scale = 1,
  twist = 1,
  pixelated = false,
  pixelSize = 5,
  className,
}: SwirlProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color1, color2, color3, speed, scale, twist, pixelated, pixelSize });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color1, color2, color3, speed, scale, twist, pixelated, pixelSize };
    redraw.current?.();
  }, [color1, color2, color3, speed, scale, twist, pixelated, pixelSize]);

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
    let time = 10;
    let last = 0;
    let dpr = 1;

    const draw = () => {
      const o = opts.current;
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform3fv(u("uC0"), rgb(o.color1));
      gl.uniform3fv(u("uC1"), rgb(o.color2));
      gl.uniform3fv(u("uC2"), rgb(o.color3));
      gl.uniform1f(u("uScale"), Math.max(o.scale, 0.05));
      gl.uniform1f(u("uTwist"), o.twist);
      gl.uniform1f(u("uPixel"), o.pixelated ? Math.max(o.pixelSize, 1) * dpr : 0);
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
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
