"use client";

import { Title } from "../../demo-kit";
import { FlockTrail } from "./flock-trail";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <FlockTrail {...p} />
      <Title>Flock Trail</Title>
    </>
  );
}
