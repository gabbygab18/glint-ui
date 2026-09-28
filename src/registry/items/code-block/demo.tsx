"use client";

import { CodeBlock } from "./code-block";

const sample = `import { useState } from "react";

// Count clicks and celebrate every tenth one.
export function Counter({ step = 1 }: { step?: number }) {
  const [count, setCount] = useState(0);
  const party = count > 0 && count % 10 === 0;

  return (
    <button className="btn" onClick={() => setCount(count + step)}>
      {party ? "Party!" : "Clicked"} {count} times
    </button>
  );
}`;

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-2xl px-4">
      <CodeBlock code={sample} {...p} />
    </div>
  );
}
