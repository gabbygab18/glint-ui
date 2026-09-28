"use client";

import { Title } from "../../demo-kit";
import { LetterGlitch } from "./letter-glitch";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LetterGlitch {...p} />
      <Title>Letter Glitch</Title>
    </>
  );
}
