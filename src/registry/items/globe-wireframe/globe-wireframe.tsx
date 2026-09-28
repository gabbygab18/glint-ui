"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GlobeWireframeProps {
  /** Grid line color. */
  lineColor?: string;
  /** Scan highlight and rim color. */
  accent?: string;
  /** Degrees between parallels. */
  latStep?: number;
  /** Degrees between meridians. */
  lonStep?: number;
  /** Auto-rotation, degrees per second. 0 stops it. */
  speed?: number;
  /** Axial tilt in degrees. */
  tilt?: number;
  /** "latitude" sweeps a ring pole to pole; "longitude" sweeps a band across the face. */
  scan?: "latitude" | "longitude" | "none";
  /** Seconds for one scan pass. */
  scanDuration?: number;
  className?: string;
}

const RAD = Math.PI / 180;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function GlobeWireframe({
  lineColor = "#64748b",
  accent = "#22d3ee",
  latStep = 15,
  lonStep = 15,
  speed = 10,
  tilt = 20,
  scan = "latitude",
  scanDuration = 4,
  className,
}: GlobeWireframeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rot = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const line = hexToRgb(lineColor);
    const acc = hexToRgb(accent);

    // Polylines of [x, y, z, lat] on the unit sphere.
    const lines: number[][] = [];
    const ls = Math.max(5, latStep);
    const ms = Math.max(5, lonStep);
    for (let lat = -90 + ls; lat < 90 - 1e-6; lat += ls) {
      const p: number[] = [];
      for (let lon = 0; lon <= 360; lon += 4) p.push(Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD), lat);
      lines.push(p);
    }
    for (let lon = 0; lon < 360; lon += ms) {
      const p: number[] = [];
      for (let lat = -90; lat <= 90; lat += 3) p.push(Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD), lat);
      lines.push(p);
    }

    let w = 0;
    let h = 0;
    let R = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let vel = 0;
    const drag = { on: false, x: 0, y: 0, t: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.4;
      draw(last);
    };

    const draw = (now: number) => {
      const yaw = rot.current.yaw;
      const pitch = tilt * RAD + rot.current.pitch;
      const cY = Math.cos(yaw);
      const sY = Math.sin(yaw);
      const cT = Math.cos(pitch);
      const sT = Math.sin(pitch);
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // eased ping-pong 0..1..0 for the scan position
      const ph = reduce ? 0.35 : (now / 1000 / Math.max(0.5, scanDuration)) % 2;
      const tri = ph < 1 ? ph : 2 - ph;
      const eased = tri * tri * (3 - 2 * tri);
      const scanLat = -80 + eased * 160;
      const scanLon = (-95 + eased * 190) * RAD; // view space
      const band = scan === "latitude" ? 14 : 0.3;

      // halo + rim
      const halo = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.22);
      halo.addColorStop(0, `rgba(${acc},0.16)`);
      halo.addColorStop(1, `rgba(${acc},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, 0, cx, cy, R);
      body.addColorStop(0, `rgba(${acc},0.07)`);
      body.addColorStop(1, `rgba(${acc},0.015)`);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // grid, batched into depth buckets; scan-lit segments collected for a second pass
      const buckets: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const lit: [number, number, number, number, number][] = [];
      for (const p of lines) {
        let px = 0;
        let py = 0;
        let pz = 0;
        let pl = 0;
        for (let i = 0; i < p.length; i += 4) {
          const x1 = p[i] * cY + p[i + 2] * sY;
          const z1 = -p[i] * sY + p[i + 2] * cY;
          const y2 = p[i + 1] * cT - z1 * sT;
          const z2 = p[i + 1] * sT + z1 * cT;
          const sx = cx + x1 * R;
          const sy = cy - y2 * R;
          const vl = Math.atan2(x1, z2);
          if (i > 0) {
            const z = (z2 + pz) / 2;
            const b = z < -0.05 ? 0 : z < 0.35 ? 1 : z < 0.7 ? 2 : 3;
            buckets[b].moveTo(px, py);
            buckets[b].lineTo(sx, sy);
            if (scan !== "none") {
              const d = scan === "latitude" ? Math.abs((p[i + 3] + pl) / 2 - scanLat) : Math.abs(vl - scanLon);
              const k = Math.exp(-((d / band) ** 2));
              if (k > 0.04 && (scan === "latitude" || z2 > 0)) lit.push([px, py, sx, sy, k * (z > 0 ? 1 : 0.25)]);
            }
          }
          px = sx;
          py = sy;
          pz = z2;
          pl = p[i + 3];
        }
      }
      ctx.lineCap = "round";
      ctx.lineWidth = 1;
      [0.07, 0.22, 0.4, 0.6].forEach((a, i) => {
        ctx.strokeStyle = `rgba(${line},${a})`;
        ctx.stroke(buckets[i]);
      });
      for (const [x0, y0, x1, y1, k] of lit) {
        ctx.strokeStyle = `rgba(${acc},${k * 0.25})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},${Math.min(1, k * 1.1)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // the scan ring itself
      if (scan !== "none") {
        const ring = new Path2D();
        const back = new Path2D();
        let first = true;
        let prevFront = true;
        for (let a = 0; a <= 360; a += 3) {
          let x: number;
          let y: number;
          let z: number;
          if (scan === "latitude") {
            const c = Math.cos(scanLat * RAD);
            const vx = c * Math.sin(a * RAD);
            const vy = Math.sin(scanLat * RAD);
            const vz = c * Math.cos(a * RAD);
            x = vx; // yaw does not move a parallel
            y = vy * cT - vz * sT;
            z = vy * sT + vz * cT;
          } else {
            const phi = (a / 360) * Math.PI - Math.PI / 2;
            x = Math.cos(phi) * Math.sin(scanLon);
            y = Math.sin(phi);
            z = Math.cos(phi) * Math.cos(scanLon);
            if (a > 180) break;
          }
          const sx = cx + x * R;
          const sy = cy - y * R;
          const front = z >= 0;
          const path = front ? ring : back;
          if (first || front !== prevFront) path.moveTo(sx, sy);
          else path.lineTo(sx, sy);
          first = false;
          prevFront = front;
        }
        ctx.strokeStyle = `rgba(${acc},0.2)`;
        ctx.lineWidth = 1;
        ctx.stroke(back);
        ctx.strokeStyle = `rgba(${acc},0.3)`;
        ctx.lineWidth = 7;
        ctx.stroke(ring);
        ctx.strokeStyle = `rgba(${acc},0.95)`;
        ctx.lineWidth = 1.8;
        ctx.stroke(ring);
      }

      ctx.strokeStyle = `rgba(${acc},0.35)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.on) {
        rot.current.yaw += vel * dt + (reduce ? 0 : speed * RAD * dt);
        vel *= Math.pow(0.04, dt);
        rot.current.pitch *= Math.pow(0.2, dt);
      }
      draw(now);
      raf = visible && (!reduce || drag.on || Math.abs(vel) > 0.01 || Math.abs(rot.current.pitch) > 0.001) ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const down = (e: PointerEvent) => {
      drag.on = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = performance.now();
      vel = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag.on) return;
      const now = performance.now();
      const d = (e.clientX - drag.x) / R;
      rot.current.yaw += d;
      rot.current.pitch = Math.max(-0.6, Math.min(0.6, rot.current.pitch + (e.clientY - drag.y) / R));
      vel = (d / Math.max(1, now - drag.t)) * 1000;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = now;
      kick();
    };
    const up = () => {
      drag.on = false;
      canvas.style.cursor = "grab";
      kick();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        vel += (e.key === "ArrowLeft" ? -1 : 1) * 1.6;
        kick();
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("keydown", key);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("keydown", key);
    };
  }, [lineColor, accent, latStep, lonStep, speed, tilt, scan, scanDuration]);

  return (
    <canvas
      ref={ref}
      tabIndex={0}
      role="img"
      aria-label="Rotating wireframe globe. Drag or use arrow keys to spin."
      className={cn("aspect-square w-full max-w-[520px] cursor-grab touch-none rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50", className)}
    />
  );
}
