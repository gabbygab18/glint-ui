"use client";

import { Title } from "../../demo-kit";
import { PrismaticBurst } from "./prismatic-burst";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PrismaticBurst {...p} />
      <Title>Prismatic Burst</Title>
    </>
  );
}
