"use client";

import { TextModifier, type TextModifierAction } from "./text-modifier";

const row: [TextModifierAction, string, string][] = [
  ["underline", "underline", "#a3e635"],
  ["box", "box", "#22d3ee"],
  ["strike", "strike", "#f472b6"],
  ["cross", "cross", "#facc15"],
];

export default function Demo(p: Record<string, unknown>) {
  const delay = Number(p.delay ?? 0);
  return (
    <div key={JSON.stringify(p)} className="flex flex-col items-center gap-14 px-6 text-center">
      <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
        Make your point <TextModifier {...p}>impossible</TextModifier> to miss.
      </p>
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-xl font-medium text-muted-foreground">
        {row.map(([action, label, color], i) => (
          <TextModifier key={action} {...p} action={action} color={color} delay={delay + 900 + i * 350}>
            {label}
          </TextModifier>
        ))}
      </div>
    </div>
  );
}
