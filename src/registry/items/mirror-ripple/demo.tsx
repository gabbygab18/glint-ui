"use client";

import { Title } from "../../demo-kit";
import { MirrorRipple } from "./mirror-ripple";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <MirrorRipple {...p} />
      <Title>Mirror Ripple</Title>
    </>
  );
}
