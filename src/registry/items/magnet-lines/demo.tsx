"use client";

import { Title } from "../../demo-kit";
import { MagnetLines } from "./magnet-lines";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <MagnetLines {...p} />
      <Title>Magnet Lines</Title>
    </div>
  );
}
