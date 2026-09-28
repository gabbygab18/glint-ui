"use client";

import { SwipeToast, useSwipeToast, type ToastTone } from "./swipe-toast";

const samples: Record<Exclude<ToastTone, "default">, { title: string; description: string }> = {
  success: { title: "Deployment ready", description: "glint-web is live on production." },
  error: { title: "Payment failed", description: "The card ending 4242 was declined." },
  info: { title: "New comment", description: "Maya replied to your design review." },
};

export default function Demo(p: Record<string, unknown>) {
  const { toasts, push, dismiss } = useSwipeToast([
    { id: "a", tone: "info", ...samples.info },
    { id: "b", tone: "error", ...samples.error },
    { id: "c", tone: "success", ...samples.success },
  ]);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(samples) as (keyof typeof samples)[]).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => push({ tone, ...samples[tone] })}
              className="h-9 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground capitalize transition-transform hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
            >
              {tone}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Hover the stack to expand it, swipe a toast sideways to dismiss.</p>
      </div>
      <SwipeToast {...p} toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
