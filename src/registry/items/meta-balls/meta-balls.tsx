"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MetaBallsProps {
  /** Number of wandering balls (plus one that follows the cursor). */
  count?: number;
  /** Color at the top. */
  color?: string;
  /** Color at the bottom. */
  color2?: string;
  /** Motion speed multiplier. */
  speed?: number;
  /** Ball size multiplier. */
  size?: number;
  /** One ball tracks the cursor while it is inside. */
  followCursor?: boolean;
  className?: string;
}

const MAX = 16;
const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform vec3 uBalls[${MAX}];uniform int uCount;uniform vec3 uC1;uniform vec3 uC2;uniform float uScale;
void main(){
  vec2 p=gl_FragCoord.xy;
  float f=0.;vec2 g=vec2(0.);
  for(int i=0;i<${MAX};i++){
    if(i>=uCount)break;
    vec2 d=p-uBalls[i].xy;float r=uBalls[i].z;
    float q=dot(d,d)+1.;float v=r*r/q;
    f+=v;g-=2.*v/q*d;
  }
  // Anti-alias the iso-line by one pixel of field change.
  float aa=length(g)+1e-4;
  float body=smoothstep(1.-aa,1.+aa,f);
  // Height sqrt(1-1/f) is an exact hemisphere for a lone ball and blends smoothly where balls merge.
  float H=sqrt(max(1.-1./max(f,1e-4),1e-3));
  vec2 gH=g/(2.*H*f*f);
  vec3 n=normalize(vec3(-gH*uScale,1.));
  vec3 L=normalize(vec3(-.45,.6,.75));
  float diff=max(dot(n,L),0.);
  float spec=pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.),28.);
  float rim=pow(1.-n.z,2.);
  vec3 base=mix(uC2,uC1,clamp(p.y/uRes.y,0.,1.));
  vec3 col=base*(.35+.75*diff)+rim*mix(base,vec3(1.),.4)*.9+spec*.85;
  float halo=smoothstep(.25,1.,f)*(1.-body)*.28;
  vec3 outc=col*body+base*halo;
  gl_FragColor=vec4(outc,max(body,halo));
}`;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function MetaBalls({
  count = 7,
  color = "#c6ff3d",
  color2 = "#0ea5e9",
  speed = 1,
  size = 1,
  followCursor = true,
  className,
}: MetaBallsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl) return () => canvas.remove();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, "p");
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes");
    const uBalls = u("uBalls");
    const uScale = u("uScale");
    const uCount = u("uCount");
    gl.uniform3fv(u("uC1"), hexToRgb(color));
    gl.uniform3fv(u("uC2"), hexToRgb(color2));

    const n = Math.min(Math.max(1, Math.round(count)), MAX - 1);
    // Deterministic Lissajous paths per ball.
    const balls = Array.from({ length: n }, (_, i) => {
      const r = (k: number) => Math.abs(Math.sin(i * 91.7 + k * 17.3) * 4375.85) % 1;
      return { ax: 0.18 + r(1) * 0.26, ay: 0.16 + r(2) * 0.24, fx: 0.2 + r(3) * 0.35, fy: 0.2 + r(4) * 0.35, px: r(5) * 6.28, py: r(6) * 6.28, s: 0.55 + r(7) * 0.55 };
    });
    const data = new Float32Array(MAX * 3);
    const m = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
    let W = 1;
    let H = 1;
    let dpr = 1;
    let t = 3;
    let prev = performance.now();
    let raf = 0;
    let visible = true;

    const render = () => {
      const min = Math.min(W, H);
      const R = min * 0.085 * size;
      balls.forEach((b, i) => {
        data[i * 3] = W / 2 + Math.sin(t * b.fx * 1.7 + b.px) * b.ax * W * 0.9;
        data[i * 3 + 1] = H / 2 + Math.cos(t * b.fy * 1.7 + b.py) * b.ay * H * 1.1;
        data[i * 3 + 2] = R * b.s;
      });
      m.x += (m.tx - m.x) * 0.12;
      m.y += (m.ty - m.y) * 0.12;
      m.on += (m.ton - m.on) * 0.06;
      data[n * 3] = m.x;
      data[n * 3 + 1] = m.y;
      data[n * 3 + 2] = R * 0.95 * m.on;
      gl.uniform3fv(uBalls, data);
      gl.uniform1i(uCount, n + 1);
      gl.uniform1f(uScale, R * 0.8);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      t += (Math.min(now - prev, 50) / 1000) * speed;
      prev = now;
      render();
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.max(1, Math.round(canvas.offsetWidth * dpr));
      H = canvas.height = Math.max(1, Math.round(canvas.offsetHeight * dpr));
      gl.viewport(0, 0, W, H);
      gl.uniform2f(uRes, W, H);
      render();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.tx = (e.clientX - r.left) * dpr;
      m.ty = (r.bottom - e.clientY) * dpr; // GL origin is bottom-left
      if (m.on < 0.02) {
        m.x = m.tx;
        m.y = m.ty;
      }
      m.ton = followCursor ? 1 : 0;
    };
    const onLeave = () => (m.ton = 0);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    const area = host.parentElement ?? host;
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [count, color, color2, speed, size, followCursor]);

  return <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} />;
}
