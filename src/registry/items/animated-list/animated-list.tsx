"use client";

import { useEffect, useState, type ReactNode } from "react";

const css = `@keyframes animated-list-in{from{opacity:0;transform:translateY(-12px) scale(.96)}to{opacity:1;transform:none}}`;

export interface AnimatedListProps {
  items: ReactNode[];
  /** Ms between new items. */
  delay?: number;
  /** Max items visible at once. */
  max?: number;
  className?: string;
}

export function AnimatedList({ items, delay = 1200, max = 4, className }: AnimatedListProps) {
  // Monotonic counter: every tick shows items[count % length] as the newest entry.
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => c + 1), delay);
    return () => window.clearInterval(id);
  }, [delay]);

  const visible = [];
  for (let n = count - 1; n >= Math.max(0, count - max); n--) visible.push(n);

  return (
    <ul className={`flex flex-col gap-3 ${className ?? ""}`}>
      <style href="animated-list" precedence="default">
        {css}
      </style>
      {visible.map((n) => (
        <li key={n} style={{ animation: "animated-list-in .45s cubic-bezier(.2,.7,.2,1)" }}>
          {items[n % items.length]}
        </li>
      ))}
    </ul>
  );
}
