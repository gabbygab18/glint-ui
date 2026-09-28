"use client";

import { TextHighlighter } from "./text-highlighter";

export default function Demo(p: Record<string, unknown>) {
  const delay = Number(p.delay ?? 0);
  const key = JSON.stringify(p);
  return (
    <p key={key} className="max-w-2xl px-6 text-3xl leading-snug font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
      The best products feel <TextHighlighter {...p}>effortless</TextHighlighter>, but behind them is{" "}
      <TextHighlighter {...p} color="#22d3ee" delay={delay + 700}>
        relentless craft
      </TextHighlighter>{" "}
      and a lot of{" "}
      <TextHighlighter {...p} color="#f472b6" delay={delay + 1400}>
        deleted code
      </TextHighlighter>
      .
    </p>
  );
}
