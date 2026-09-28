"use client";

import { useEffect } from "react";
import { ToastProvider, useToast } from "./toast";

const btn =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97]";

function Controls() {
  const { toast } = useToast();

  // Seed a small stack so the preview shows one (fixed ids keep Strict Mode from doubling it).
  useEffect(() => {
    toast({ id: "seed-1", title: "Invite sent", description: "Maya will get an email shortly.", variant: "success", duration: 15000 });
    toast({ id: "seed-2", title: "Syncing workspace", description: "Pulling 128 changes from main.", variant: "loading" });
    toast({
      id: "seed-3",
      title: "Message archived",
      description: "You can find it in the archive folder.",
      duration: 15000,
      action: { label: "Undo", onClick: () => toast({ title: "Restored", variant: "success" }) },
    });
  }, [toast]);

  const deploy = () => {
    const id = toast({ title: "Deploying to production", description: "Building 42 routes...", variant: "loading" });
    setTimeout(() => toast({ id, title: "Deployed", description: "acme.app is live in 3 regions.", variant: "success" }), 1800);
  };

  return (
    <div className="grid w-full max-w-xs gap-3 rounded-2xl border border-border bg-card p-5 shadow-xl">
      <p className="font-semibold text-foreground">Notifications</p>
      <div className="grid grid-cols-2 gap-2">
        <button className={btn} onClick={() => toast({ title: "Changes saved", variant: "success" })}>
          Success
        </button>
        <button className={btn} onClick={() => toast({ title: "Payment failed", description: "Your card was declined.", variant: "error" })}>
          Error
        </button>
        <button className={btn} onClick={() => toast({ title: "Storage almost full", description: "92% of 10 GB used.", variant: "warning" })}>
          Warning
        </button>
        <button className={btn} onClick={deploy}>
          Promise
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Hover the stack to expand it, swipe a toast to dismiss.</p>
    </div>
  );
}

export default function Demo(p: Record<string, unknown>) {
  return (
    <ToastProvider {...p} position="absolute">
      <Controls />
    </ToastProvider>
  );
}
