"use client";

import { useEffect, useRef } from "react";

export interface DotFieldProps {
  /** Dot color in the valleys. */
  lowColor?: string;
  /** Dot color on the crests. */
  highColor?: string;
  /** Travel and wave speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Wave height. */
  amplitude?: number;
  /** Dot size multiplier. */
  dotSize?: number;
  /** Grid density multiplier; higher packs the dots tighter. */
  density?: number;
  className?: string;
}

const DEPTH = 34;
const HALF_WIDTH = 40;

const VERT = `
attribute vec2 aGrid;
uniform float uTime;
uniform float uTravel;
uniform float uAspect;
uniform float uAmp;
uniform float uSize;
uniform float uDpr;
uniform float uHeight;
uniform vec2 uMouse;
uniform vec3 uLow;
uniform vec3 uHigh;
varying vec3 vCol;
varying float vAlpha;

float terrain(vec2 p, float t) {
  return sin(p.x * 0.35 + t * 0.6) * 0.6
       + sin(p.y * 0.28 - t * 0.8 + p.x * 0.12) * 0.8
       + sin((p.x - p.y) * 0.55 + t * 0.5) * 0.3
       + sin(length(p - vec2(0.0, 20.0)) * 0.6 - t * 1.1) * 0.35;
}

void main() {
  float depth = ${DEPTH}.0;
  float z = mod(aGrid.y - uTravel, depth);
  float y = terrain(vec2(aGrid.x, z + uTravel), uTime) * uAmp;

  vec3 cam = vec3((uMouse.x - 0.5) * 3.0, 3.2 + (uMouse.y - 0.5) * 1.2, -1.5);
  vec3 r = vec3(aGrid.x, y, z) - cam;
  float cp = cos(0.3), sp = sin(0.3);
  r = vec3(r.x, r.y * cp + r.z * sp, r.z * cp - r.y * sp);

  float fov = 1.5;
  gl_Position = vec4(r.x * fov / uAspect, r.y * fov, 0.0, r.z);
  float size = uSize * uDpr * uHeight * 0.03 / r.z;
  gl_PointSize = clamp(size, 1.0, 32.0);

  float hn = clamp(y / (uAmp * 3.6 + 0.001) + 0.5, 0.0, 1.0);
  vCol = mix(uLow, uHigh, smoothstep(0.25, 0.8, hn));
  float fog = smoothstep(depth, depth * 0.35, z) * smoothstep(0.0, 3.0, z);
  // Sub-pixel dots fade instead of shimmering.
  vAlpha = fog * (0.45 + 0.55 * smoothstep(0.2, 0.85, hn)) * min(size, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec3 vCol;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.2, d) * vAlpha;
  gl_FragColor = vec4(vCol * a, a);
}
`;

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function program(gl: WebGLRenderingContext) {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, FRAG],
  ] as const) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, "aGrid");
  gl.linkProgram(prog);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

export function DotField({
  lowColor = "#5b4bff",
  highColor = "#5eead4",
  speed = 1,
  amplitude = 1,
  dotSize = 1,
  density = 1,
  className,
}: DotFieldProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ lowColor, highColor, speed, amplitude, dotSize, density });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { lowColor, highColor, speed, amplitude, dotSize, density };
    redraw.current?.();
  }, [lowColor, highColor, speed, amplitude, dotSize, density]);

  useEffect(() => {
    const el = host.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    const prog = gl && program(gl);
    if (!gl || !prog) {
      canvas.remove();
      return;
    }
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const loc = {
      time: u("uTime"),
      travel: u("uTravel"),
      aspect: u("uAspect"),
      amp: u("uAmp"),
      size: u("uSize"),
      dpr: u("uDpr"),
      height: u("uHeight"),
      mouse: u("uMouse"),
      low: u("uLow"),
      high: u("uHigh"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0;
    let visible = true;
    let time = 2;
    let last = 0;
    let dpr = 1;
    let count = 0;
    let builtDensity = -1;

    // Rebuilds the flat grid of (x, z) points when the density changes.
    const build = (d: number) => {
      const step = 0.22 / Math.min(Math.max(d, 0.3), 3);
      const cols = Math.floor((HALF_WIDTH * 2) / step);
      const rows = Math.floor(DEPTH / step);
      const data = new Float32Array(cols * rows * 2);
      let i = 0;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          data[i++] = -HALF_WIDTH + c * step;
          data[i++] = r * step;
        }
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      count = cols * rows;
      builtDensity = d;
    };

    const draw = () => {
      const o = opts.current;
      if (o.density !== builtDensity) build(o.density);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(loc.time, time);
      gl.uniform1f(loc.travel, time * 1.4);
      gl.uniform1f(loc.aspect, canvas.width / canvas.height);
      gl.uniform1f(loc.amp, o.amplitude);
      gl.uniform1f(loc.size, o.dotSize);
      gl.uniform1f(loc.dpr, dpr);
      gl.uniform1f(loc.height, canvas.height / dpr);
      gl.uniform2f(loc.mouse, pointer.x, pointer.y);
      gl.uniform3fv(loc.low, rgb(o.lowColor));
      gl.uniform3fv(loc.high, rgb(o.highColor));
      gl.drawArrays(gl.POINTS, 0, count);
    };
    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
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
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.tx = (e.clientX - r.left) / r.width;
      pointer.ty = 1 - (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      pointer.tx = 0.5;
      pointer.ty = 0.5;
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
