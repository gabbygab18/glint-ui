"use client";

import { Title } from "../../demo-kit";
import { ParallaxStrings } from "./parallax-strings";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ParallaxStrings {...p} />
      <Title>Parallax Strings</Title>
    </>
  );
}
