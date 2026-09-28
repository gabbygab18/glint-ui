"use client";

import { useEffect, useRef } from "react";

export type ShapeBlurShape = "rounded" | "circle" | "nested";

export interface ShapeBlurProps {
  shape?: ShapeBlurShape;
  color?: string;
  /** Second color the outline shifts toward around its perimeter. */
  accent?: string;
  /** Shape size as a fraction of the shorter side. */
  size?: number;
  /** Outline width in px when fully sharp. */
  thickness?: number;
  /** Blur radius in px away from the cursor. */
  blur?: number;
  /** Px around the cursor where the outline comes into focus. */
  focus?: number;
  className?: string;
}

function hexToVec(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Signed distance to the outline; the gaussian width of the stroke grows with distance from the focus point.
const FRAG = `precision highp float;
uniform vec2 uRes, uMouse;
uniform float uSize, uThick, uBlur, uFocus, uShape, uDpr, uTime;
uniform vec3 uA, uB;
float box(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
float stroke(float d, float w){ float e = max(abs(d) - uThick * .5 * uDpr, 0.); return exp(-e * e / (w * w)); }
void main(){
  vec2 p = gl_FragCoord.xy - uRes * .5;
  float S = min(uRes.x, uRes.y) * uSize * .5;
  float f = smoothstep(0., uFocus * uDpr, length(gl_FragCoord.xy - uMouse));
  float w = mix(.7 * uDpr, uBlur * uDpr, f);
  float peak = mix(1.25, .55, f);
  float a = 0.;
  if (uShape < .5 || uShape > 1.5) a += stroke(box(p, vec2(S), S * .3), w);
  if (uShape > .5) a = max(a, stroke(length(p) - S * (uShape > 1.5 ? .55 : 1.), w));
  a *= peak;
  float hue = .5 + .5 * sin(atan(p.y, p.x) * 1. + uTime * .4);
  vec3 col = mix(uA, uB, hue);
  col = mix(col, vec3(1.), (1. - f) * .35);
  a = clamp(a, 0., 1.);
  gl_FragColor = vec4(col * a, a);
}`;

export function ShapeBlur({
  shape = "nested",
  color = "#c6ff3d",
  accent = "#22d3ee",
  size = 0.62,
  thickness = 2,
  blur = 26,
  focus = 170,
  className,
}: ShapeBlurProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const host = el.parentElement ?? el;
    // A fresh canvas per effect run: a context lost in cleanup can never be reused.
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return () => canvas.remove();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sh = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform1f(u("uShape"), ["rounded", "circle", "nested"].indexOf(shape));
    gl.uniform1f(u("uSize"), size);
    gl.uniform1f(u("uThick"), thickness);
    gl.uniform1f(u("uBlur"), blur);
    gl.uniform1f(u("uFocus"), focus);
    gl.uniform3fv(u("uA"), hexToVec(color));
    gl.uniform3fv(u("uB"), hexToVec(accent));

    let dpr = 1;
    let raf = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, inside: false };
    const pos = { x: 0, y: 0 };
    const t0 = performance.now();

    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      const W = canvas.width;
      const H = canvas.height;
      // Without a cursor the focus point laps the shape, so it never sits fully blurred.
      let tx = W / 2 + Math.cos(t * 0.7) * Math.min(W, H) * size * 0.5;
      let ty = H / 2 + Math.sin(t * 0.7) * Math.min(W, H) * size * 0.5;
      if (pointer.inside) {
        tx = pointer.x * dpr;
        ty = H - pointer.y * dpr;
      }
      pos.x += (tx - pos.x) * 0.12;
      pos.y += (ty - pos.y) * 0.12;
      gl.uniform2f(u("uMouse"), pos.x, pos.y);
      gl.uniform1f(u("uTime"), t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      frame();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uDpr"), dpr);
      pos.x = canvas.width / 2;
      pos.y = canvas.height;
      if (reduced) frame();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [shape, color, accent, size, thickness, blur, focus]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    />
  );
}
