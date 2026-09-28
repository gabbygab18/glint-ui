"use client";

import { useEffect, useRef } from "react";

export interface LiquidChromeProps {
  /** Metal tint. */
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Wave frequency; higher packs more folds in. */
  scale?: number;
  /** Height of the flowing folds. */
  amplitude?: number;
  /** Cursor and click ripples. */
  interactive?: boolean;
  className?: string;
}

const MAX_RIPPLES = 8;

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uScale;
uniform float uAmp;
uniform vec4 uRip[${MAX_RIPPLES}];

float field(vec2 p){
  float t = uTime;
  vec2 q = p * uScale;
  q += 0.45 * vec2(sin(q.y * 1.2 + t * 0.6), sin(q.x * 1.1 - t * 0.5));
  q += 0.25 * vec2(sin(q.y * 2.3 - t * 0.4 + 1.3), sin(q.x * 2.1 + t * 0.45 + 2.1));
  float h = sin(q.x * 1.3 + t * 0.5) * 0.5 + sin(q.y * 1.7 - t * 0.4) * 0.5
          + sin((q.x + q.y) * 0.9 + t * 0.3) * 0.35 + sin(length(q) * 1.1 - t * 0.7) * 0.2;
  h *= uAmp / uScale;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRip[i];
    if (r.w > 0.001) {
      float x = length(p - r.xy) - r.z * 0.5;
      h += sin(x * 42.0) * exp(-x * x * 90.0) * exp(-r.z * 1.4) * r.w * 0.02;
    }
  }
  return h;
}

float studio(vec3 r){
  float y = r.y * 0.85 + r.x * 0.3;
  float bands = pow(0.5 + 0.5 * sin(y * 6.5 + 1.2), 5.0) * 0.9 + pow(0.5 + 0.5 * sin(y * 13.0 - 0.7), 8.0) * 0.35;
  return 0.03 + bands + 0.35 * smoothstep(0.1, 1.0, y) + 0.08 * smoothstep(-0.2, -0.9, y);
}

void main(){
  vec2 p = gl_FragCoord.xy / uRes.y;
  float e = 1.5 / uRes.y;
  float hx = field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0));
  float hy = field(p + vec2(0.0, e)) - field(p - vec2(0.0, e));
  vec3 n = normalize(vec3(-hx / (2.0 * e), -hy / (2.0 * e), 1.0 / 0.9));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);

  float c = studio(r);
  vec3 L = normalize(vec3(-0.45, 0.6, 0.65));
  float spec = pow(max(dot(r, L), 0.0), 70.0);
  float fres = pow(1.0 - n.z, 2.0);
  vec3 col = uColor * c + vec3(spec * 1.1) + uColor * fres * 0.6;
  col = mix(col, col * vec3(0.8, 0.9, 1.1), smoothstep(0.0, 0.5, r.x)); // cool sky tint on one side
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
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

export function LiquidChrome({
  color = "#d4dcec",
  speed = 1,
  scale = 3,
  amplitude = 0.6,
  interactive = true,
  className,
}: LiquidChromeProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color: hexToRgb(color), speed, scale, amplitude, interactive });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { color: hexToRgb(color), speed, scale, amplitude, interactive };
    redraw.current?.();
  }, [color, speed, scale, amplitude, interactive]);

  useEffect(() => {
    const el = host.current!;
    const area = el.parentElement ?? el;
    // Ripple ring buffer: x, y (container-height units, y up), age, strength.
    const rip = new Float32Array(MAX_RIPPLES * 4);
    let next = 0;
    let t = 6;
    let idle = 0;
    let lastX = -1;
    let lastY = -1;
    const add = (x: number, y: number, s: number) => {
      rip.set([x, y, 0, s], next * 4);
      next = (next + 1) % MAX_RIPPLES;
    };

    const shader = mountShader(el, FRAG, (set, dt) => {
      const o = opts.current;
      t += dt * o.speed;
      for (let i = 0; i < MAX_RIPPLES; i++) {
        rip[i * 4 + 2] += dt;
        if (rip[i * 4 + 2] > 3) rip[i * 4 + 3] = 0;
      }
      // A gentle drop now and then when nobody is touching it.
      idle += dt;
      if (o.interactive && idle > 2.6) {
        idle = 0;
        const aspect = el.clientWidth / Math.max(el.clientHeight, 1);
        add((0.2 + Math.random() * 0.6) * aspect, 0.2 + Math.random() * 0.6, 0.8);
      }
      set("uTime", t);
      set("uColor", o.color);
      set("uScale", Math.max(o.scale, 0.2));
      set("uAmp", o.amplitude);
      set("uRip", o.interactive ? Array.from(rip) : new Array(MAX_RIPPLES * 4).fill(0), 4);
    });
    if (!shader) return;
    redraw.current = shader.redraw;

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [(e.clientX - r.left) / r.height, 1 - (e.clientY - r.top) / r.height];
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e);
      idle = 0;
      if (Math.hypot(x - lastX, y - lastY) < 0.06) return;
      lastX = x;
      lastY = y;
      add(x, y, 0.6);
    };
    const onDown = (e: PointerEvent) => {
      const [x, y] = local(e);
      idle = 0;
      add(x, y, 1.6);
    };
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerdown", onDown);
    return () => {
      redraw.current = undefined;
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerdown", onDown);
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
