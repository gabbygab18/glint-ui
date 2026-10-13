"use client";

import { Title } from "../../demo-kit";
import { EmberPath } from "./ember-path";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <EmberPath {...p} />
      <Title>Ember Path</Title>
    </>
  );
}
