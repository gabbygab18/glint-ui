"use client";

import { useState } from "react";
import { PromptBar } from "./prompt-bar";

const sample = () => [new File(["brief"], "launch-brief.pdf", { type: "application/pdf" }), new File(["img"], "hero-shot.png", { type: "image/png" })];

export default function Demo(p: Record<string, unknown>) {
  const [files] = useState(sample);
  const [last, setLast] = useState("");
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 px-4">
      <PromptBar
        defaultFiles={files}
        {...p}
        onSubmit={(text, f) => {
          setLast(`Sent "${text || "(no text)"}" with ${f.length} file${f.length === 1 ? "" : "s"}`);
          return new Promise((r) => setTimeout(r, 2500));
        }}
      />
      <p className="h-4 text-xs text-muted-foreground">{last || "Enter sends, Shift+Enter adds a line."}</p>
    </div>
  );
}
