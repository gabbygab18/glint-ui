"use client";

import { Title } from "../../demo-kit";
import { GlyphStorm } from "./glyph-storm";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GlyphStorm {...p} />
      <Title>Glyph Storm</Title>
    </>
  );
}
