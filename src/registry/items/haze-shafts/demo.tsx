"use client";

import { Title } from "../../demo-kit";
import { HazeShafts } from "./haze-shafts";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <HazeShafts {...p} />
      <Title>Haze Shafts</Title>
    </>
  );
}
