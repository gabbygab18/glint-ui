"use client";

import { useEffect, useRef } from "react";

export interface GridDistortionProps {
  /** Image URL. Remote images need CORS headers (it becomes a WebGL texture). */
  imageSrc: string;
  /** Grid cells per side. */
  grid?: number;
  /** Radius of cursor influence, as a fraction of the height. */
  mouseRadius?: number;
  /** How far cells get dragged by the cursor. */
  strength?: number;
  /** Per-frame easing back to rest, 0-1; higher is slower. */
  relaxation?: number;
  className?: string;
}

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform sampler2D uImg;
uniform sampler2D uGrid;
uniform vec2 uScale;
uniform float uReady;

// offsets are packed as 16-bit fixed point in RG (x) and BA (y), range -0.5..0.5
vec2 offsetAt(vec2 uv) {
  vec4 g = texture2D(uGrid, uv) * 255.0;
  return vec2(g.r * 256.0 + g.g, g.b * 256.0 + g.a) / 65535.0 - 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 o = offsetAt(uv);
  vec2 iuv = (uv - o - 0.5) * uScale + 0.5;
  vec2 ca = o * 0.03;
  vec3 col = vec3(
    texture2D(uImg, iuv + ca).r,
    texture2D(uImg, iuv).g,
    texture2D(uImg, iuv - ca).b);
  col *= 1.0 - 0.25 * length(uv - 0.5);
  gl_FragColor = vec4(col, 1.0) * uReady;
}
`;

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

type Ptr = { x: number; y: number; hover: number };
type Uni = (name: string) => WebGLUniformLocation | null;

/** Full-screen shader canvas inside `host`: DPR-capped resize, offscreen pause, reduced motion, eased pointer. */
function runShader(host: HTMLElement, frag: string, speed: () => number, update: (gl: WebGLRenderingContext, u: Uni, pointer: Ptr) => void) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
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
  const u: Uni = (n) => {
    if (!locs.has(n)) locs.set(n, gl.getUniformLocation(prog, n));
    return locs.get(n) ?? null;
  };
  const zone = host.parentElement ?? host;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ptr: Ptr = { x: 0.5, y: 0.5, hover: 0 };
  const goal: Ptr = { ...ptr };
  let raf = 0;
  let last = 0;
  let time = 0;

  const draw = () => {
    gl.uniform2f(u("uRes"), canvas.width, canvas.height);
    gl.uniform1f(u("uTime"), time);
    gl.uniform2f(u("uMouse"), ptr.x, ptr.y);
    gl.uniform1f(u("uHover"), ptr.hover);
    update(gl, u, goal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const k = 1 - Math.exp(-dt * 4);
    for (const key of ["x", "y", "hover"] as const) ptr[key] += (goal[key] - ptr[key]) * k;
    time += dt * speed();
    draw();
    raf = requestAnimationFrame(loop);
  };
  const run = (on: boolean) => {
    if (on && !raf && !reduced) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  };
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    goal.x = (e.clientX - r.left) / r.width;
    goal.y = 1 - (e.clientY - r.top) / r.height;
    goal.hover = 1;
  };
  const leave = () => {
    goal.hover = 0;
  };
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([e]) => run(e.isIntersecting));
  ro.observe(host);
  io.observe(host);
  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerleave", leave);
  return {
    gl,
    redraw: () => {
      if (!raf) draw();
    },
    dispose: () => {
      run(false);
      ro.disconnect();
      io.disconnect();
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerleave", leave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

export function GridDistortion({
  imageSrc,
  grid = 15,
  mouseRadius = 0.18,
  strength = 1,
  relaxation = 0.92,
  className,
}: GridDistortionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = useRef({ grid, mouseRadius, strength, relaxation });
  const api = useRef<ReturnType<typeof runShader>>(null);
  const image = useRef<{ tex: WebGLTexture; w: number; h: number } | null>(null);

  useEffect(() => {
    opts.current = { grid, mouseRadius, strength, relaxation };
    api.current?.redraw();
  }, [grid, mouseRadius, strength, relaxation]);

  useEffect(() => {
    let size = 0;
    let offsets = new Float32Array(0);
    let bytes = new Uint8Array(0);
    let gridTex: WebGLTexture | null = null;
    let prev = { x: 0.5, y: 0.5 };
    let last = performance.now();

    const r = runShader(
      ref.current!,
      FRAG,
      () => 1,
      (gl, u, goal) => {
        const o = opts.current;
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        const G = Math.max(2, Math.round(o.grid));
        if (G !== size) {
          size = G;
          offsets = new Float32Array(G * G * 2);
          bytes = new Uint8Array(G * G * 4);
        }
        // drag cells near the cursor along its motion, then ease everything back
        const vx = goal.x - prev.x;
        const vy = goal.y - prev.y;
        prev = { x: goal.x, y: goal.y };
        const asp = gl.drawingBufferWidth / gl.drawingBufferHeight;
        const R = Math.max(0.01, o.mouseRadius);
        const decay = Math.pow(Math.min(Math.max(o.relaxation, 0), 0.999), dt * 60);
        for (let j = 0; j < G; j++) {
          for (let i = 0; i < G; i++) {
            const k = (j * G + i) * 2;
            const d = Math.hypot(((i + 0.5) / G - goal.x) * asp, (j + 0.5) / G - goal.y);
            if (goal.hover > 0 && d < R) {
              const f = (1 - d / R) * o.strength;
              offsets[k] += vx * f;
              offsets[k + 1] += vy * f;
            }
            for (let c = 0; c < 2; c++) {
              const v = Math.min(0.5, Math.max(-0.5, offsets[k + c] * decay));
              offsets[k + c] = v;
              const q = Math.round((v + 0.5) * 65535);
              bytes[k * 2 + c * 2] = q >> 8;
              bytes[k * 2 + c * 2 + 1] = q & 255;
            }
          }
        }
        gridTex ??= gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, gridTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, G, G, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(u("uGrid"), 1);

        const img = image.current;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, img?.tex ?? null);
        gl.uniform1i(u("uImg"), 0);
        gl.uniform1f(u("uReady"), img ? 1 : 0);
        if (img) {
          // cover-fit the image
          const ia = img.w / img.h;
          gl.uniform2f(u("uScale"), asp > ia ? 1 : asp / ia, asp > ia ? ia / asp : 1);
        }
      },
    );
    api.current = r;
    return () => {
      r?.dispose();
      api.current = null;
      image.current = null;
    };
  }, []);

  useEffect(() => {
    const gl = api.current?.gl;
    if (!gl) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled || gl.isContextLost()) return;
      const tex = image.current?.tex ?? gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      image.current = { tex, w: img.naturalWidth, h: img.naturalHeight };
      api.current?.redraw();
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    />
  );
}
