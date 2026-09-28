"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MetallicPaintProps {
  /** Built-in mask shape. "text" uses the text prop. */
  shape?: "star" | "heart" | "ring" | "text";
  /** Glyphs used when shape is "text". Short is best (1–3 characters). */
  text?: string;
  /** Flow speed multiplier. */
  speed?: number;
  /** Highlight tint of the chrome. */
  tint?: string;
  /** Density of the reflected bands. */
  bands?: number;
  /** Bevel depth; higher bends reflections more near the edges. */
  bevel?: number;
  className?: string;
}

const TEX = 512;
const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform sampler2D uMask;uniform vec3 uTint;uniform float uBands;uniform float uBevel;uniform vec2 uMouse;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.1+9.2;a*=.5;}return v;}
vec3 chrome(float x){
  // Dark steel -> bright highlight bands.
  float s=.5+.5*sin(x*6.2831);
  s=pow(s,1.6);
  vec3 dark=vec3(.05,.06,.08);vec3 mid=vec3(.45,.48,.55);
  vec3 c=mix(dark,mid,smoothstep(0.,.55,s));
  return mix(c,uTint,smoothstep(.55,1.,s));
}
void main(){
  float m=min(uRes.x,uRes.y);
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/m*1.08+.5;
  uv.y=1.-uv.y;
  if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.){gl_FragColor=vec4(0.);return;}
  vec4 s=texture2D(uMask,uv);
  float a=s.r;
  if(a<.004){gl_FragColor=vec4(0.);return;}
  float e=2.5/${TEX}.;
  float hx=texture2D(uMask,uv+vec2(e,0.)).g-texture2D(uMask,uv-vec2(e,0.)).g;
  float hy=texture2D(uMask,uv+vec2(0.,e)).g-texture2D(uMask,uv-vec2(0.,e)).g;
  vec3 n=normalize(vec3(-hx*uBevel,-hy*uBevel,1.));
  float h=s.g;
  float t=uTime*.22;
  vec2 q=uv*2.6;
  vec2 w=vec2(fbm(q+vec2(t,-t*.7)),fbm(q+vec2(-t*.6,t)+5.2));
  float x=(uv.x*.8-uv.y*1.1)*uBands+w.x*2.2+w.y*.8+n.x*1.6+n.y*1.1-h*.6+t*1.4+uMouse.x*.4;
  // Tiny per-channel offset gives a hint of dispersion at the band edges.
  vec3 col=vec3(chrome(x+.012).r,chrome(x).g,chrome(x-.012).b);
  vec3 L=normalize(vec3(.4+uMouse.x*.6,.5-uMouse.y*.6,.8));
  float spec=pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.),40.);
  col+=spec*.6*uTint;
  col*=.7+.3*smoothstep(0.,.6,h);
  gl_FragColor=vec4(col*a,a);
}`;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function drawShape(ctx: CanvasRenderingContext2D, shape: MetallicPaintProps["shape"], text: string) {
  const c = TEX / 2;
  ctx.fillStyle = ctx.strokeStyle = "#fff";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (shape === "text") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 420;
    ctx.font = `900 ${size}px system-ui, sans-serif`;
    const tw = ctx.measureText(text).width;
    if (tw > TEX * 0.86) size *= (TEX * 0.86) / tw;
    ctx.font = `900 ${size}px system-ui, sans-serif`;
    ctx.fillText(text, c, c + size * 0.04);
    return;
  }
  if (shape === "heart") {
    ctx.moveTo(c, 430);
    ctx.bezierCurveTo(40, 290, 60, 90, 180, 90);
    ctx.bezierCurveTo(230, 90, 256, 125, c, 160);
    ctx.bezierCurveTo(256, 125, 282, 90, 332, 90);
    ctx.bezierCurveTo(452, 90, 472, 290, c, 430);
  } else if (shape === "ring") {
    ctx.arc(c, c, 210, 0, Math.PI * 2);
    ctx.arc(c, c, 120, 0, Math.PI * 2, true);
  } else {
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 100 : 225;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(c + Math.cos(a) * r, c + 16 + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.lineWidth = 26;
    ctx.stroke();
  }
  ctx.fill();
}

export function MetallicPaint({
  shape = "star",
  text = "G",
  speed = 1,
  tint = "#eef2ff",
  bands = 1.6,
  bevel = 7,
  className,
}: MetallicPaintProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl) return () => canvas.remove();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mask texture: R = crisp shape (alpha), G = blurred copy (height field for the bevel).
    const sharp = document.createElement("canvas");
    sharp.width = sharp.height = TEX;
    const sctx = sharp.getContext("2d", { willReadFrequently: true })!;
    drawShape(sctx, shape, text);
    const soft = document.createElement("canvas");
    soft.width = soft.height = TEX;
    const bctx = soft.getContext("2d", { willReadFrequently: true })!;
    bctx.filter = "blur(16px)";
    bctx.drawImage(sharp, 0, 0);
    const A = sctx.getImageData(0, 0, TEX, TEX).data;
    const B = bctx.getImageData(0, 0, TEX, TEX).data;
    const px = new Uint8Array(TEX * TEX * 4);
    for (let i = 0; i < px.length; i += 4) {
      px[i] = A[i + 3];
      px[i + 1] = B[i + 3];
      px[i + 3] = 255;
    }

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
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX, TEX, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uMouse = u("uMouse");
    gl.uniform1i(u("uMask"), 0);
    gl.uniform3fv(u("uTint"), hexToRgb(tint));
    gl.uniform1f(u("uBands"), bands);
    gl.uniform1f(u("uBevel"), bevel);

    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    let t = 4;
    let prev = performance.now();
    let raf = 0;
    let visible = true;
    const render = () => {
      m.x += (m.tx - m.x) * 0.05;
      m.y += (m.ty - m.y) * 0.05;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, m.x, m.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      t += (Math.min(now - prev, 50) / 1000) * speed;
      prev = now;
      render();
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.offsetWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.offsetHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      render();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      m.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    };

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
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      area.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [shape, text, speed, tint, bands, bevel]);

  return <div ref={ref} aria-hidden className={cn("pointer-events-none relative", className)} />;
}
