"use client";

import { Title } from "../../demo-kit";
import { OilFilm } from "./oil-film";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <OilFilm {...p} />
      <Title>Oil Film</Title>
    </>
  );
}
