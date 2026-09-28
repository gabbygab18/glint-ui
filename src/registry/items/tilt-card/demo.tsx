"use client";

import { Card } from "../../demo-kit";
import { TiltCard } from "./tilt-card";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TiltCard {...p} className="rounded-2xl">
      <Card title="Tilt Card" body="Move your cursor over me." />
    </TiltCard>
  );
}
