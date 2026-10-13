"use client";

import { demoImages, Title } from "../../demo-kit";
import { RowSlide } from "./row-slide";

const images = demoImages(14, 400, 400);

export default function Demo(p: Record<string, unknown>) {
  const items = (p.items as string[] | undefined)?.length ? (p.items as string[]) : images;
  return (
    <>
      <RowSlide {...p} items={items} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.75))]" />
      <Title>Row Slide</Title>
    </>
  );
}
