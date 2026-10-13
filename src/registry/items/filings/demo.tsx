"use client";

import { Title } from "../../demo-kit";
import { Filings } from "./filings";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <Filings {...p} />
      <Title>Filings</Title>
    </div>
  );
}
