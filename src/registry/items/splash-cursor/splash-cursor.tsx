"use client";

import { useEffect, useRef } from "react";

export interface SplashCursorProps {
  /** Velocity grid size on the shorter side. Higher is finer and slower. */
  simResolution?: number;
  /** Ink texture size on the shorter side. */
  dyeResolution?: number;
  /** How quickly ink fades, per second. */
  dissipation?: number;
  /** How quickly motion settles, per second. */
  velocityDissipation?: number;
  /** Vorticity: how much the ink curls into swirls. */
  curl?: number;
  /** Splat radius. */
  splatRadius?: number;
  /** How hard cursor motion pushes the ink. */
  force?: number;
  /** Throw random splashes while the cursor is away. */
  idle?: boolean;
  className?: string;
}

const VERT = `precision highp float;
attribute vec2 aPos;
uniform vec2 texel;
varying vec2 vUv, vL, vR, vT, vB;
void main(){
  vUv = aPos * .5 + .5;
  vL = vUv - vec2(texel.x, 0.); vR = vUv + vec2(texel.x, 0.);
  vT = vUv + vec2(0., texel.y); vB = vUv - vec2(0., texel.y);
  gl_Position = vec4(aPos, 0., 1.);
}`;
const HEAD = `precision highp float;varying vec2 vUv, vL, vR, vT, vB;`;
// Classic stable-fluids pipeline: vorticity, divergence, Jacobi pressure solve, projection, advection.
const FRAGS = {
  splat: `uniform sampler2D uTarget;uniform float aspect, radius;uniform vec3 color;uniform vec2 point;
    void main(){vec2 p=vUv-point;p.x*=aspect;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.);}`,
  advect: `uniform sampler2D uVelocity, uSource;uniform vec2 texel;uniform float dt, dissipation;
    void main(){vec2 c=vUv-dt*texture2D(uVelocity,vUv).xy*texel;gl_FragColor=texture2D(uSource,c)/(1.+dissipation*dt);}`,
  divergence: `uniform sampler2D uVelocity;void main(){vec2 C=texture2D(uVelocity,vUv).xy;
    float L=vL.x<0.?-C.x:texture2D(uVelocity,vL).x;float R=vR.x>1.?-C.x:texture2D(uVelocity,vR).x;
    float T=vT.y>1.?-C.y:texture2D(uVelocity,vT).y;float B=vB.y<0.?-C.y:texture2D(uVelocity,vB).y;
    gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}`,
  curl: `uniform sampler2D uVelocity;void main(){gl_FragColor=vec4(.5*(texture2D(uVelocity,vR).y-texture2D(uVelocity,vL).y-texture2D(uVelocity,vT).x+texture2D(uVelocity,vB).x),0.,0.,1.);}`,
  vorticity: `uniform sampler2D uVelocity, uCurl;uniform float curl, dt;void main(){
    float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;
    vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+1e-4;f*=curl*C;f.y*=-1.;
    gl_FragColor=vec4(clamp(texture2D(uVelocity,vUv).xy+f*dt,-1000.,1000.),0.,1.);}`,
  pressure: `uniform sampler2D uPressure, uDivergence;void main(){
    gl_FragColor=vec4((texture2D(uPressure,vL).x+texture2D(uPressure,vR).x+texture2D(uPressure,vT).x+texture2D(uPressure,vB).x-texture2D(uDivergence,vUv).x)*.25,0.,0.,1.);}`,
  gradient: `uniform sampler2D uPressure, uVelocity;void main(){
    vec2 v=texture2D(uVelocity,vUv).xy-vec2(texture2D(uPressure,vR).x-texture2D(uPressure,vL).x,texture2D(uPressure,vT).x-texture2D(uPressure,vB).x);
    gl_FragColor=vec4(v,0.,1.);}`,
  scale: `uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`,
  display: `uniform sampler2D uTexture;void main(){vec3 c=1.-exp(-texture2D(uTexture,vUv).rgb*3.);gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`,
};

type Fbo = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

function hsv(h: number) {
  const f = (n: number) => {
    const k = (n + h * 6) % 6;
    return 1 - Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5) * 0.15, f(3) * 0.15, f(1) * 0.15];
}

export function SplashCursor({
  simResolution = 128,
  dyeResolution = 512,
  dissipation = 0.8,
  velocityDissipation = 0.4,
  curl = 20,
  splatRadius = 0.25,
  force = 6000,
  idle = true,
  className,
}: SplashCursorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const host = el.parentElement ?? el;
    // A fresh canvas per effect run: a context lost in cleanup can never be reused.
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false, stencil: false });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return () => canvas.remove();

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    const programs = Object.fromEntries(
      Object.entries(FRAGS).map(([name, src]) => {
        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, HEAD + src);
        gl.compileShader(fs);
        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "aPos");
        gl.linkProgram(prog);
        const uniforms: Record<string, WebGLUniformLocation | null> = {};
        const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
        for (let i = 0; i < n; i++) {
          const name = gl.getActiveUniform(prog, i)!.name;
          uniforms[name] = gl.getUniformLocation(prog, name);
        }
        return [name, { prog, uniforms }];
      }),
    ) as Record<keyof typeof FRAGS, { prog: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }>;

    let active = programs.display;
    const pick = (p: typeof active) => {
      active = p;
      gl.useProgram(p.prog);
    };
    const set = (name: string, ...v: number[]) => {
      const loc = active.uniforms[name];
      if (v.length === 1) gl.uniform1f(loc, v[0]);
      else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
      else gl.uniform3f(loc, v[0], v[1], v[2]);
    };
    const bind = (name: string, f: Fbo, unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, f.tex);
      gl.uniform1i(active.uniforms[name], unit);
    };
    const blit = (target: Fbo | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
      gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const fbo = (w: number, h: number): Fbo => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      const f = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fbo: f, w, h };
    };
    const double = (w: number, h: number) => {
      const d = { read: fbo(w, h), write: fbo(w, h), swap: () => ([d.read, d.write] = [d.write, d.read]) };
      return d;
    };
    const size = (res: number) => {
      const a = canvas.width / canvas.height;
      const big = Math.round(res * Math.max(a, 1 / a));
      return a > 1 ? [big, res] : [res, big];
    };

    let velocity: ReturnType<typeof double>, dye: ReturnType<typeof double>, pressure: ReturnType<typeof double>;
    let divergence: Fbo, curlFbo: Fbo;
    const textures: WebGLTexture[] = [];
    const frameBuffers: WebGLFramebuffer[] = [];
    const free = () => {
      textures.forEach((t) => gl.deleteTexture(t));
      frameBuffers.forEach((f) => gl.deleteFramebuffer(f));
      textures.length = frameBuffers.length = 0;
    };
    const track = <T extends Fbo | ReturnType<typeof double>>(x: T) => {
      const list: Fbo[] = "read" in x ? [x.read, x.write] : [x as Fbo];
      for (const f of list) {
        textures.push(f.tex);
        frameBuffers.push(f.fbo);
      }
      return x;
    };

    // ponytail: resizing restarts the simulation; resample old ink into new targets if that ever matters.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, el.clientWidth * dpr);
      canvas.height = Math.max(1, el.clientHeight * dpr);
      free();
      const [sw, sh] = size(simResolution);
      const [dw, dh] = size(dyeResolution);
      velocity = track(double(sw, sh));
      pressure = track(double(sw, sh));
      dye = track(double(dw, dh));
      divergence = track(fbo(sw, sh));
      curlFbo = track(fbo(sw, sh));
    };

    const splat = (x: number, y: number, dx: number, dy: number, color: number[]) => {
      pick(programs.splat);
      set("aspect", canvas.width / canvas.height);
      set("point", x, y);
      set("radius", (splatRadius / 100) * Math.max(1, canvas.width / canvas.height));
      bind("uTarget", velocity.read, 0);
      set("color", dx, dy, 0);
      blit(velocity.write);
      velocity.swap();
      bind("uTarget", dye.read, 0);
      set("color", color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    };

    const step = (dt: number) => {
      const tx = 1 / velocity.read.w;
      const ty = 1 / velocity.read.h;
      pick(programs.curl);
      set("texel", tx, ty);
      bind("uVelocity", velocity.read, 0);
      blit(curlFbo);

      pick(programs.vorticity);
      set("texel", tx, ty);
      bind("uVelocity", velocity.read, 0);
      bind("uCurl", curlFbo, 1);
      set("curl", curl);
      set("dt", dt);
      blit(velocity.write);
      velocity.swap();

      pick(programs.divergence);
      set("texel", tx, ty);
      bind("uVelocity", velocity.read, 0);
      blit(divergence);

      pick(programs.scale);
      bind("uTexture", pressure.read, 0);
      set("value", 0.8);
      blit(pressure.write);
      pressure.swap();

      pick(programs.pressure);
      set("texel", tx, ty);
      bind("uDivergence", divergence, 0);
      for (let i = 0; i < 20; i++) {
        bind("uPressure", pressure.read, 1);
        blit(pressure.write);
        pressure.swap();
      }

      pick(programs.gradient);
      set("texel", tx, ty);
      bind("uPressure", pressure.read, 0);
      bind("uVelocity", velocity.read, 1);
      blit(velocity.write);
      velocity.swap();

      pick(programs.advect);
      set("texel", tx, ty);
      set("dt", dt);
      bind("uVelocity", velocity.read, 0);
      bind("uSource", velocity.read, 0);
      set("dissipation", velocityDissipation);
      blit(velocity.write);
      velocity.swap();

      bind("uVelocity", velocity.read, 0);
      bind("uSource", dye.read, 1);
      set("dissipation", dissipation);
      blit(dye.write);
      dye.swap();

      pick(programs.display);
      bind("uTexture", dye.read, 0);
      blit(null);
    };

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let lastInput = 0;
    let nextIdle = 0;
    let hue = Math.random();
    const pointer = { x: 0, y: 0, down: false, moved: false };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 60);
      last = now;
      if (idle && now - lastInput > 2500 && now > nextIdle) {
        nextIdle = now + 900 + Math.random() * 900;
        burst(1);
      }
      step(dt);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      if (pointer.moved) {
        hue = (hue + 0.004) % 1;
        splat(x, y, (x - pointer.x) * force, (y - pointer.y) * force, hsv(hue));
      }
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
      lastInput = performance.now();
    };
    const onLeave = () => {
      pointer.moved = false;
    };
    const onDown = () => {
      // A click throws a bright burst in a random direction.
      const a = Math.random() * Math.PI * 2;
      splat(pointer.x, pointer.y, Math.cos(a) * 900, Math.sin(a) * 900, hsv(Math.random()).map((c) => c * 6));
    };

    const burst = (n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        splat(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, Math.cos(a) * 1200, Math.sin(a) * 1200, hsv(Math.random()).map((c) => c * 5));
      }
    };

    resize();
    // Opening burst so the surface is alive before the first move.
    burst(5);

    const ro = new ResizeObserver(() => {
      if (Math.abs(el.clientWidth * Math.min(window.devicePixelRatio || 1, 2) - canvas.width) > 1) resize();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [simResolution, dyeResolution, dissipation, velocityDissipation, curl, splatRadius, force, idle]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    />
  );
}
