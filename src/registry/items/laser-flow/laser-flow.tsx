"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface LaserFlowProps {
  color?: string;
  /** Flow speed multiplier. */
  speed?: number;
  /** Overall brightness. */
  intensity?: number;
  /** Beam core width multiplier. */
  width?: number;
  /** Where the beam lands, 0 = bottom, 1 = top. */
  impact?: number;
  /** Flicker amount, 0–1. */
  flicker?: number;
  className?: string;
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec3 uColor;uniform float uIntensity;uniform float uWidth;uniform float uImpact;uniform float uFlicker;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+17.1;a*=.5;}return v;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime;
  float floorY=-.5+uImpact;
  float dy=p.y-floorY;
  float above=smoothstep(-.015,.03,dy);
  // Beam wobbles slightly and thins toward the top.
  float wob=(fbm(vec2(p.y*1.4-t*.35,t*.15))-.5)*.035*above;
  float d=abs(p.x-wob);
  float w=.0035*uWidth*(1.+.35*smoothstep(.4,0.,dy));
  float flow=fbm(vec2(p.x*9.,p.y*3.+t*2.2));
  float streak=fbm(vec2(p.x*38.,p.y*1.2+t*3.5));
  float core=exp(-d*d/(w*w))*above;
  float glow=(w*3./(d+w*3.))*above*(.55+.45*flow);
  float haze=exp(-d*d/.012)*above*flow*flow*.9;
  float fil=exp(-d*d/(w*w*18.))*above*smoothstep(.45,.9,streak)*.9;
  // Splash where the beam meets the floor.
  vec2 q=vec2(p.x*.45,dy*2.4);
  float e=length(q);
  float mist=fbm(vec2(abs(p.x)*3.5-t*.6,dy*9.+t*.2));
  float pool=exp(-e*e*55.)*1.6+.012/(e+.012)*.35;
  float spread=exp(-abs(dy)*14.)*exp(-abs(p.x)*1.6)*mist*mist*1.4;
  float under=smoothstep(.0,-.25,dy)*exp(-abs(p.x)*5.)*mist*.3;
  // Motes drifting up through the glow.
  vec2 g=vec2(p.x*26.,p.y*26.-t*1.4);
  vec2 cell=floor(g);vec2 f=fract(g)-.5;
  float h=hash(cell);
  vec2 off=vec2(hash(cell+3.1),hash(cell+7.7))-.5;
  float mote=smoothstep(.09,0.,length(f-off*.6))*step(.86,h)*(.5+.5*sin(t*3.+h*40.));
  mote*=exp(-abs(p.x)*9.)*smoothstep(-.1,.1,dy);
  float fl=1.-uFlicker*.25*(.5+.5*sin(t*47.))*noise(vec2(t*6.,1.));
  vec3 col=uColor*(glow*.9+haze+pool+spread+under+mote*1.5+fil)*fl;
  col+=mix(uColor,vec3(1.),.75)*(core*1.6+exp(-e*e*400.)*1.2)*fl;
  col*=uIntensity;
  col=1.-exp(-col*1.3);
  float a=clamp(max(col.r,max(col.g,col.b)),0.,1.);
  gl_FragColor=vec4(col,a);
}`;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function LaserFlow({
  color = "#b388ff",
  speed = 1,
  intensity = 1,
  width = 1,
  impact = 0.28,
  flicker = 0.5,
  className,
}: LaserFlowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A fresh canvas per mount: a context lost on unmount can never be reused.
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
    const uTime = u("uTime");
    gl.uniform3fv(u("uColor"), hexToRgb(color));
    gl.uniform1f(u("uIntensity"), intensity);
    gl.uniform1f(u("uWidth"), width);
    gl.uniform1f(u("uImpact"), impact);
    gl.uniform1f(u("uFlicker"), flicker);

    let raf = 0;
    let visible = true;
    let t = 7;
    let prev = performance.now();
    const render = () => {
      gl.uniform1f(uTime, t);
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
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [color, speed, intensity, width, impact, flicker]);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} />
  );
}
