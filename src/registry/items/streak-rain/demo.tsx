"use client";

import { Title } from "../../demo-kit";
import { StreakRain } from "./streak-rain";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <StreakRain {...p} />
      <Title>Streak Rain</Title>
    </>
  );
}
