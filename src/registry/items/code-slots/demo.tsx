"use client";

import { useState } from "react";
import { CodeSlots } from "./code-slots";

export default function Demo(p: Record<string, unknown>) {
  const [round, setRound] = useState(0);
  const [ok, setOk] = useState(false);
  const length = (p.length as number) ?? 6;
  const answer = "123456789".slice(0, length);

  return (
    <div className="grid justify-items-center gap-5 text-center">
      <div>
        <p className="font-semibold text-foreground">Check your inbox</p>
        <p className="text-sm text-muted-foreground">
          Enter the code we sent you. (Psst: it&apos;s <span className="font-mono text-foreground">{answer}</span>)
        </p>
      </div>
      <CodeSlots
        key={`${round}-${length}`}
        {...p}
        onComplete={async (code) => {
          await new Promise((r) => setTimeout(r, 500));
          setOk(code === answer);
          return code === answer;
        }}
      />
      <button
        type="button"
        onClick={() => {
          setOk(false);
          setRound((r) => r + 1);
        }}
        className={`text-xs text-muted-foreground underline-offset-4 hover:underline ${ok ? "" : "invisible"}`}
      >
        Try again
      </button>
    </div>
  );
}
