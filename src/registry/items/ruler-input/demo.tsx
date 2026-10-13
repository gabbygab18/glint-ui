"use client";

import { useState } from "react";
import { RulerInput } from "./ruler-input";

export default function Demo(p: Record<string, unknown>) {
  const [radius, setRadius] = useState(24);
  const [angle, setAngle] = useState(12);
  const [opacity, setOpacity] = useState(64);
  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div
        className="size-36 bg-gradient-to-br from-lime-300 to-cyan-500 shadow-2xl"
        style={{ borderRadius: radius, rotate: `${angle}deg`, opacity: opacity / 100 }}
      />
      <div className="grid gap-1">
        <RulerInput {...p} value={opacity} onChange={setOpacity} />
        <RulerInput label="Radius" unit="px" min={0} max={72} value={radius} onChange={setRadius} />
        <RulerInput label="Rotate" unit="°" min={-180} max={180} value={angle} onChange={setAngle} />
        <p className="text-center text-xs text-muted-foreground">Drag sideways · Shift ×10 · Alt ×0.1</p>
      </div>
    </div>
  );
}
