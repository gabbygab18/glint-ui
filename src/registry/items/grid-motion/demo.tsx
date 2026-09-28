"use client";

import { demoImages, Title } from "../../demo-kit";
import { GridMotion } from "./grid-motion";

const images = demoImages(14, 400, 400);

export default function Demo(p: Record<string, unknown>) {
  const items = (p.items as string[] | undefined)?.length ? (p.items as string[]) : images;
  return (
    <>
      <GridMotion {...p} items={items} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.75))]" />
      <Title>Grid Motion</Title>
    </>
  );
}
