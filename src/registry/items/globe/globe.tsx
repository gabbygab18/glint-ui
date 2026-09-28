"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GlobeMarker {
  lat: number;
  lon: number;
  label?: string;
}

export interface GlobeProps {
  /** Glowing city markers. */
  markers?: GlobeMarker[];
  /** Arcs as index pairs into `markers`. */
  arcs?: [number, number][];
  /** Land dot color. */
  dotColor?: string;
  /** Marker, arc and atmosphere color. */
  accent?: string;
  /** Auto-rotation speed (degrees per second). 0 stops it. */
  speed?: number;
  /** Axial tilt in degrees. */
  tilt?: number;
  /** Number of dots sampled over the sphere (land dots are a share of these). */
  density?: number;
  /** Draw city labels on the front side. */
  showLabels?: boolean;
  className?: string;
}

// Coarse continent outlines [lon, lat]. Just enough for a recognisable dotted globe.
const LAND: number[][][] = [
  // North America
  [[-168,66],[-162,70],[-150,71],[-128,70],[-115,68],[-95,72],[-80,73],[-75,68],[-64,60],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-84,30],[-90,30],[-97,27],[-97,22],[-94,18],[-88,21],[-87,16],[-83,10],[-78,8],[-80,7],[-85,11],[-92,15],[-105,20],[-110,24],[-112,29],[-117,32],[-120,35],[-124,40],[-124,48],[-130,55],[-140,60],[-150,59],[-158,56],[-165,60]],
  // Greenland
  [[-73,78],[-60,82],[-30,83],[-20,75],[-22,70],[-40,65],[-43,60],[-50,64],[-55,70]],
  // Iceland
  [[-24,64],[-14,66],[-13,65],[-18,63]],
  // South America
  [[-80,9],[-75,11],[-62,11],[-52,5],[-50,0],[-35,-5],[-35,-9],[-39,-15],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-62,-40],[-65,-45],[-68,-50],[-69,-55],[-74,-52],[-75,-45],[-73,-37],[-71,-28],[-70,-18],[-76,-14],[-81,-6],[-80,-1],[-78,2],[-77,7]],
  // Eurasia
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[8,57],[5,61],[10,64],[15,69],[25,71],[40,67],[45,68],[60,69],[70,73],[80,73],[100,78],[115,74],[130,71],[140,72],[160,70],[180,68],[180,65],[170,60],[163,60],[155,59],[143,59],[137,54],[141,48],[135,43],[129,41],[127,35],[122,40],[121,37],[122,30],[120,24],[111,21],[108,18],[106,10],[103,9],[100,13],[103,1],[100,4],[98,10],[98,16],[94,17],[92,22],[88,22],[80,15],[77,8],[73,17],[72,21],[67,24],[62,25],[57,26],[56,24],[59,22],[52,16],[43,12],[39,21],[35,28],[34,31],[36,36],[30,36],[27,37],[26,40],[24,40],[22,37],[20,40],[18,40],[16,38],[13,45],[12,44],[16,41],[10,44],[7,43],[3,43],[0,39],[-5,36]],
  // Great Britain
  [[-5,50],[1,51],[2,53],[-2,56],[-3,58],[-6,58],[-5,55],[-3,54],[-5,52]],
  // Ireland
  [[-10,52],[-6,52],[-6,55],[-8,55],[-10,54]],
  // Africa
  [[-17,21],[-16,28],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[38,18],[43,12],[51,12],[50,9],[44,2],[40,-3],[40,-10],[35,-20],[33,-26],[27,-34],[20,-35],[18,-32],[12,-18],[13,-12],[9,-1],[9,4],[5,4],[-8,5],[-13,8],[-17,14]],
  // Madagascar
  [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
  // Japan
  [[130,31],[135,34],[140,35],[142,40],[141,45],[145,44],[140,41],[137,37],[132,35]],
  // Philippines
  [[120,18],[122,18],[124,13],[126,7],[125,6],[122,7],[123,11],[120,14]],
  // Sumatra, Borneo, New Guinea
  [[95,5],[98,4],[106,-6],[102,-4]],
  [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
  [[131,-1],[141,-3],[150,-10],[141,-9],[137,-5]],
  // Australia
  [[114,-22],[114,-34],[118,-35],[124,-34],[131,-31],[138,-35],[141,-38],[147,-38],[150,-37],[153,-30],[153,-25],[146,-19],[142,-11],[141,-17],[136,-12],[131,-11],[126,-14],[122,-18]],
  // New Zealand
  [[166,-46],[172,-41],[175,-37],[178,-38],[174,-42],[170,-46]],
];

function isLand(lon: number, lat: number) {
  if (lat < -72) return true; // Antarctica
  for (const poly of LAND) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

const DEFAULT_MARKERS: GlobeMarker[] = [
  { lat: 37.77, lon: -122.42, label: "San Francisco" },
  { lat: 40.71, lon: -74.0, label: "New York" },
  { lat: -23.55, lon: -46.63, label: "São Paulo" },
  { lat: 51.5, lon: -0.12, label: "London" },
  { lat: 6.52, lon: 3.38, label: "Lagos" },
  { lat: 25.2, lon: 55.27, label: "Dubai" },
  { lat: 1.35, lon: 103.82, label: "Singapore" },
  { lat: 14.6, lon: 120.98, label: "Manila" },
  { lat: 35.68, lon: 139.69, label: "Tokyo" },
  { lat: -33.87, lon: 151.21, label: "Sydney" },
];
const DEFAULT_ARCS: [number, number][] = [[0, 8], [0, 3], [1, 3], [1, 2], [3, 5], [3, 4], [5, 6], [6, 9], [7, 8], [6, 7]];

const RAD = Math.PI / 180;
const toVec = (lat: number, lon: number): [number, number, number] => [
  Math.cos(lat * RAD) * Math.sin(lon * RAD),
  Math.sin(lat * RAD),
  Math.cos(lat * RAD) * Math.cos(lon * RAD),
];

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function Globe({
  markers = DEFAULT_MARKERS,
  arcs = DEFAULT_ARCS,
  dotColor = "#94a3b8",
  accent = "#c6ff3d",
  speed = 8,
  tilt = 18,
  density = 12000,
  showLabels = false,
  className,
}: GlobeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Rotation survives prop changes so the globe does not jump when a control moves.
  const rot = useRef({ yaw: -20 * RAD, pitch: 0 });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = hexToRgb(dotColor);
    const acc = hexToRgb(accent);

    // Fibonacci sphere, kept only where there is land.
    const land: number[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < density; i++) {
      const y = 1 - (2 * (i + 0.5)) / density;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const x = Math.cos(th) * r;
      const z = Math.sin(th) * r;
      const lat = Math.asin(y) / RAD;
      const lon = Math.atan2(x, z) / RAD;
      if (isLand(lon, lat)) land.push(x, y, z);
    }
    const pts = new Float32Array(land);
    const mk = markers.map((m) => toVec(m.lat, m.lon));
    // Great-circle arcs lifted off the surface, sampled once.
    const arcPaths = arcs
      .filter(([a, b]) => mk[a] && mk[b])
      .map(([a, b]) => {
        const A = mk[a];
        const B = mk[b];
        const dotAB = Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
        const om = Math.acos(dotAB);
        const lift = 0.08 + om * 0.14;
        const n = 48;
        const out: number[] = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const s = Math.sin(om) || 1;
          const k1 = Math.sin((1 - t) * om) / s;
          const k2 = Math.sin(t * om) / s;
          const h = 1 + lift * Math.sin(Math.PI * t);
          out.push((A[0] * k1 + B[0] * k2) * h, (A[1] * k1 + B[1] * k2) * h, (A[2] * k1 + B[2] * k2) * h);
        }
        return out;
      });

    let w = 0;
    let h = 0;
    let R = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let vel = 0; // drag inertia, rad/s
    const drag = { on: false, x: 0, y: 0, t: 0 };
    const tiltRad = tilt * RAD;

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

    // rotate (yaw about Y, then tilt about X) and return [sx, sy, depth]
    const proj = (x: number, y: number, z: number, cy: number, sy: number, ct: number, st: number): [number, number, number] => {
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y2 = y * ct - z1 * st;
      const z2 = y * st + z1 * ct;
      return [w / 2 + x1 * R, h / 2 - y2 * R, z2];
    };

    const draw = (now: number) => {
      const { yaw } = rot.current;
      const pitch = tiltRad + rot.current.pitch;
      const cY = Math.cos(yaw);
      const sY = Math.sin(yaw);
      const cT = Math.cos(pitch);
      const sT = Math.sin(pitch);
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // atmosphere + body
      const halo = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.24);
      halo.addColorStop(0, `rgba(${acc},0)`);
      halo.addColorStop(0.45, `rgba(${acc},0.18)`); // peaks right at the rim
      halo.addColorStop(1, `rgba(${acc},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(28,32,38,0.96)");
      body.addColorStop(1, "rgba(8,9,11,0.96)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${acc},0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots, bucketed by depth so fillStyle changes only a few times
      const size = Math.max(1.2, R / 105);
      for (let b = 0; b < 5; b++) {
        const lo = b / 5;
        const hi = (b + 1) / 5;
        ctx.fillStyle = `rgba(${dot},${0.18 + hi * 0.82})`;
        for (let i = 0; i < pts.length; i += 3) {
          const [sx, sy, z] = proj(pts[i], pts[i + 1], pts[i + 2], cY, sY, cT, sT);
          if (z <= lo || z > hi) continue;
          const s = size * (0.6 + z * 0.5);
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }

      // arcs: faint full path + a travelling comet
      ctx.lineCap = "round";
      arcPaths.forEach((p, ai) => {
        const pr: [number, number, number][] = [];
        for (let i = 0; i < p.length; i += 3) pr.push(proj(p[i], p[i + 1], p[i + 2], cY, sY, cT, sT));
        ctx.lineWidth = 1.2;
        for (let i = 1; i < pr.length; i++) {
          const z = (pr[i][2] + pr[i - 1][2]) / 2;
          if (z < -0.15) continue;
          ctx.strokeStyle = `rgba(${acc},${0.12 + Math.max(0, z) * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(pr[i - 1][0], pr[i - 1][1]);
          ctx.lineTo(pr[i][0], pr[i][1]);
          ctx.stroke();
        }
        const head = reduce ? 0.6 : ((now / 2600 + ai * 0.37) % 1.4) / 1.1; // 0..~1.27, pause at the end
        const n = pr.length - 1;
        const tail = 0.28;
        ctx.lineWidth = 2;
        for (let i = 1; i <= n; i++) {
          const t = i / n;
          if (t > head || t < head - tail) continue;
          const z = pr[i][2];
          if (z < -0.1) continue;
          const a = (1 - (head - t) / tail) * (0.4 + Math.max(0, z) * 0.6);
          ctx.strokeStyle = `rgba(${acc},${a})`;
          ctx.beginPath();
          ctx.moveTo(pr[i - 1][0], pr[i - 1][1]);
          ctx.lineTo(pr[i][0], pr[i][1]);
          ctx.stroke();
        }
      });

      // markers
      ctx.font = `500 ${Math.max(10, R / 22)}px ui-sans-serif, system-ui, sans-serif`;
      mk.forEach((m, i) => {
        const [sx, sy, z] = proj(m[0], m[1], m[2], cY, sY, cT, sT);
        if (z < 0) return;
        const pulse = reduce ? 0.5 : ((now / 1600 + i * 0.23) % 1);
        const r = Math.max(2.2, R / 95);
        ctx.strokeStyle = `rgba(${acc},${(1 - pulse) * 0.8 * z})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(sx, sy, r + pulse * r * 4, 0, Math.PI * 2);
        ctx.stroke();
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3.5);
        g.addColorStop(0, `rgba(${acc},${0.6 * z})`);
        g.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.5 + z * 0.5})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        if (showLabels && markers[i].label && z > 0.25) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, (z - 0.25) * 2.5) * 0.85})`;
          ctx.fillText(markers[i].label!, sx + r * 2.2, sy + r * 0.8);
        }
      });
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.on) {
        rot.current.yaw += vel * dt + (reduce ? 0 : speed * RAD * dt);
        vel *= Math.pow(0.04, dt); // inertia decays
        rot.current.pitch *= Math.pow(0.2, dt); // tilt eases back
      }
      draw(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
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
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const d = dx / R;
      rot.current.yaw += d;
      rot.current.pitch = Math.max(-0.6, Math.min(0.6, rot.current.pitch + dy / R));
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
  }, [markers, arcs, dotColor, accent, speed, tilt, density, showLabels]);

  return (
    <canvas
      ref={ref}
      tabIndex={0}
      role="img"
      aria-label={`Rotating globe with ${markers.length} locations${markers.length ? `: ${markers.map((m) => m.label).filter(Boolean).join(", ")}` : ""}. Drag or use arrow keys to spin.`}
      className={cn("aspect-square w-full max-w-[520px] cursor-grab touch-none rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50", className)}
    />
  );
}
