"use client";

import { Title } from "../../demo-kit";
import { BackgroundPaths } from "./background-paths";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BackgroundPaths {...p} />
      <Title>Background Paths</Title>
    </>
  );
}
