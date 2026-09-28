"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export interface ModelViewerProps {
  /** Procedural model to show. */
  shape?: "torus-knot" | "blob" | "rounded-box" | "torus";
  color?: string;
  /** 0 = dielectric, 1 = metal. */
  metalness?: number;
  roughness?: number;
  /** Thin-film rainbow sheen, 0 to 1. */
  iridescence?: number;
  autoRotate?: boolean;
  /** Auto-rotate speed (OrbitControls units, 2 = 30s per turn). */
  autoRotateSpeed?: number;
  /** Closest camera distance. */
  minDistance?: number;
  /** Farthest camera distance. */
  maxDistance?: number;
  /** Soft contact shadow under the model. */
  shadow?: boolean;
  className?: string;
}

function makeGeometry(shape: NonNullable<ModelViewerProps["shape"]>) {
  if (shape === "torus") return new THREE.TorusGeometry(0.9, 0.38, 64, 160);
  if (shape === "rounded-box") return new RoundedBoxGeometry(1.5, 1.5, 1.5, 8, 0.28);
  if (shape === "blob") {
    // Icosphere pushed around by layered sines: an organic pebble.
    const g = new THREE.IcosahedronGeometry(1.15, 48);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      const d = 0.12 * Math.sin(n.x * 3.1 + n.y * 1.7) + 0.08 * Math.sin(n.y * 4.3 - n.z * 2.9) + 0.05 * Math.sin(n.z * 6.1 + n.x * 5.3);
      v.copy(n).multiplyScalar(1.15 + d);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  return new THREE.TorusKnotGeometry(0.75, 0.28, 320, 48);
}

export function ModelViewer({
  shape = "torus-knot",
  color = "#c4b5fd",
  metalness = 0.65,
  roughness = 0.18,
  iridescence = 0.6,
  autoRotate = true,
  autoRotateSpeed = 1.5,
  minDistance = 3,
  maxDistance = 9,
  shadow = true,
  className,
}: ModelViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const three = useRef<{ material: THREE.MeshPhysicalMaterial; controls: OrbitControls; ground: THREE.Mesh } | null>(null);

  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none;cursor:grab";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTex = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(3.2, 1.6, 4.4);

    // Studio rig: warm key with soft shadows, cool rim from behind.
    const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
    key.position.set(3, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 8;
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 });
    const rim = new THREE.DirectionalLight(0x9ecbff, 1.6);
    rim.position.set(-4, 2, -4);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.15));

    const material = new THREE.MeshPhysicalMaterial({
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescenceIOR: 1.6,
      envMapIntensity: 1.2,
    });
    const geometry = makeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    const model = new THREE.Group();
    model.add(mesh);
    scene.add(model);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.35 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.55;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    three.current = { material, controls, ground };
    const grab = () => (renderer.domElement.style.cursor = "grabbing");
    const release = () => (renderer.domElement.style.cursor = "grab");
    controls.addEventListener("start", grab);
    controls.addEventListener("end", release);

    // Keyboard: arrows orbit the model, +/- zoom.
    const onKey = (e: KeyboardEvent) => {
      const step = 0.25;
      if (e.key === "ArrowLeft") model.rotation.y -= step;
      else if (e.key === "ArrowRight") model.rotation.y += step;
      else if (e.key === "ArrowUp") model.rotation.x -= step;
      else if (e.key === "ArrowDown") model.rotation.x += step;
      else if (e.key === "+" || e.key === "=" || e.key === "-") {
        const dir = camera.position.clone().sub(controls.target);
        const len = THREE.MathUtils.clamp(dir.length() * (e.key === "-" ? 1.15 : 0.87), controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(dir.setLength(len));
      } else return;
      e.preventDefault();
    };
    el.addEventListener("keydown", onKey);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) loop();
    });
    io.observe(el);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("keydown", onKey);
      controls.removeEventListener("start", grab);
      controls.removeEventListener("end", release);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      envTex.dispose();
      pmrem.dispose();
      room.dispose();
      renderer.dispose();
      renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
      renderer.domElement.remove();
      three.current = null;
    };
  }, [shape]);

  // Cheap prop changes update the live scene instead of rebuilding the WebGL context.
  useEffect(() => {
    const t = three.current;
    if (!t) return;
    t.material.color.set(color);
    Object.assign(t.material, { metalness, roughness, iridescence });
    t.controls.autoRotate = autoRotate && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.controls.autoRotateSpeed = autoRotateSpeed;
    t.controls.minDistance = minDistance;
    t.controls.maxDistance = Math.max(minDistance, maxDistance);
    t.ground.visible = shadow;
  }, [shape, color, metalness, roughness, iridescence, autoRotate, autoRotateSpeed, minDistance, maxDistance, shadow]);

  return (
    <div
      ref={host}
      tabIndex={0}
      role="img"
      aria-label="3D model viewer. Drag or use arrow keys to rotate, scroll or plus and minus to zoom."
      className={`relative size-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
    />
  );
}
