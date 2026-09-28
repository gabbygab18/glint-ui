"use client";

import { Title } from "../../demo-kit";
import { BubbleMenu } from "./bubble-menu";

const items = [
  { label: "Home", href: "#", color: "#3b82f6" },
  { label: "About", href: "#", color: "#10b981" },
  { label: "Projects", href: "#", color: "#f59e0b" },
  { label: "Blog", href: "#", color: "#ef4444" },
  { label: "Contact", href: "#", color: "#8b5cf6" },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Title>Pop the bubble</Title>
      <BubbleMenu
        items={items}
        logo={
          <span>
            bubble<span className="text-primary">.</span>
          </span>
        }
        {...p}
        position="absolute"
      />
    </>
  );
}
