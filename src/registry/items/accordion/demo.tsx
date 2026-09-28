"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const faq = [
  {
    q: "Can I use these components in commercial projects?",
    a: "Yes. Copy the source into your app and ship it. There is no attribution requirement and no runtime package to install.",
  },
  {
    q: "Do they work with my shadcn/ui theme?",
    a: "Every color comes from shadcn tokens like bg-card, border-border and text-muted-foreground, so light, dark and custom themes just work.",
  },
  {
    q: "What about keyboard and screen reader users?",
    a: "Headers are real buttons inside headings with aria-expanded and aria-controls. Use Arrow Up/Down to move between them and Home/End to jump to the ends.",
  },
  {
    q: "Does it respect reduced motion?",
    a: "Yes. With prefers-reduced-motion enabled the panels open instantly instead of animating their height.",
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card px-5 py-1 shadow-xl">
      <Accordion key={String(p.type)} defaultValue={["q0"]} {...p}>
        {faq.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
