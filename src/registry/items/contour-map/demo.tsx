"use client";

import { Title } from "../../demo-kit";
import { ContourMap } from "./contour-map";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ContourMap {...p} />
      <Title>Contour Map</Title>
    </>
  );
}
