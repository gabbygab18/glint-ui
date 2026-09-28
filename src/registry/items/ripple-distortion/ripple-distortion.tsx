"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface RippleDistortionProps {
  /** Image URL. Must be CORS-enabled. */
  src: string;
  alt?: string;
  /** Peak displacement in px. */
  strength?: number;
  /** Px per second the rings travel. */
  speed?: number;
  /** Px between wave crests. */
  wavelength?: number;
  /** Seconds before a ripple dies out. */
  lifetime?: number;
  className?: string;
}

const MAX = 24;

const VERT = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

// Analytic ripples: each ring is a sine band travelling out from where the cursor touched.
const FRAG = `precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uImg;
uniform float uTime, uStrength, uSpeed, uWave, uLife, uDpr;
uniform vec3 uR[${MAX}];
varying vec2 vUv;
void main(){
  vec2 px = vUv * uRes;
  vec2 off = vec2(0.);
  float shade = 0.;
  for (int i = 0; i < ${MAX}; i++) {
    float age = uTime - uR[i].z;
    if (age < 0. || age > uLife) continue;
    vec2 d = px - uR[i].xy;
    float dist = length(d) + 1e-3;
    float x = dist - age * uSpeed * uDpr;
    float band = 60. * uDpr;
    float env = exp(-x * x / (band * band)) * (1. - age / uLife) * (1. - age / uLife);
    float wave = sin(x * 6.2832 / (uWave * uDpr)) * env;
    off += d / dist * wave;
    shade += cos(x * 6.2832 / (uWave * uDpr)) * env;
  }
  // Soft cap so overlapping rings never tear the image apart.
  off /= max(1., length(off));
  shade = clamp(shade, -1., 1.);
  vec2 uv = vUv + off * uStrength * uDpr / uRes;
  // Cover-fit the image.
  vec2 s = uRes / uImg;
  vec2 fit = uRes / (uImg * max(s.x, s.y));
  vec2 t = (uv - .5) * fit + .5;
  vec2 ca = off * .8 * uDpr / uRes;
  vec3 col = vec3(texture2D(uTex, t + ca).r, texture2D(uTex, t).g, texture2D(uTex, t - ca).b);
  col += shade * .07;
  gl_FragColor = vec4(col, 1.);
}`;

export function RippleDistortion({
  src,
  alt = "",
  strength = 8,
  speed = 260,
  wavelength = 34,
  lifetime = 2.5,
  className,
}: RippleDistortionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A fresh canvas per effect run: a context lost in cleanup can never be reused.
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    ref.current!.appendChild(canvas);
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
    gl.uniform1f(u("uStrength"), reduced ? 0 : strength);
    gl.uniform1f(u("uSpeed"), speed);
    gl.uniform1f(u("uWave"), wavelength);
    gl.uniform1f(u("uLife"), lifetime);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 20, 255]));
    for (const [k, v] of [
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
      [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    ])
      gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.uniform2f(u("uImg"), 1, 1);

    const ripples = new Float32Array(MAX * 3).fill(-1e4);
    let head = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let lastDrop = { x: -1e4, y: 0, t: 0 };
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;

    const draw = () => {
      raf = 0;
      const t = now();
      gl.uniform1f(u("uTime"), t);
      gl.uniform3fv(u("uR[0]"), ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Keep animating only while some ripple is still alive.
      const alive = ripples.some((v, i) => i % 3 === 2 && t - v < lifetime);
      if (alive && visible && !reduced) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const drop = (x: number, y: number) => {
      ripples.set([x * dpr, (canvas.clientHeight - y) * dpr, now()], head * 3);
      head = (head + 1) % MAX;
      kick();
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(u("uDpr"), dpr);
      kick();
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform2f(u("uImg"), img.naturalWidth, img.naturalHeight);
      if (!reduced) drop(canvas.clientWidth / 2, canvas.clientHeight / 2);
      kick();
    };
    img.src = src;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const t = performance.now();
      // Drop a new ring every ~40px of travel or 140ms of hovering.
      if (Math.hypot(x - lastDrop.x, y - lastDrop.y) > 40 || t - lastDrop.t > 140) {
        lastDrop = { x, y, t };
        drop(x, y);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    if (!reduced) canvas.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      img.onload = null;
      canvas.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [src, strength, speed, wavelength, lifetime]);

  return (
    <div ref={ref} role="img" aria-label={alt} className={cn("relative overflow-hidden", className)} />
  );
}
