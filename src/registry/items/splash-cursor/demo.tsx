"use client";

import { Title } from "../../demo-kit";
import { SplashCursor } from "./splash-cursor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SplashCursor {...p} />
      <Title>Splash Cursor</Title>
    </>
  );
}
