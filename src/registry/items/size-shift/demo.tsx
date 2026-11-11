"use client";

import { CheckCircle2, CloudUpload, FileText } from "lucide-react";
import { useState } from "react";
import { SizeShift } from "./size-shift";

const STEPS = ["Upload", "Review", "Done"] as const;
type Step = (typeof STEPS)[number];

function Content({ step }: { step: Step }) {
  if (step === "Upload")
    return (
      <div className="flex items-center gap-3 p-4">
        <CloudUpload className="size-5 text-primary" />
        <p className="text-sm font-medium text-foreground">Drop a file to start</p>
      </div>
    );
  if (step === "Review")
    return (
      <div className="w-72 p-5">
        <p className="text-sm font-semibold text-foreground">Review 3 files</p>
        <ul className="mt-3 space-y-2">
          {["brand-guide.pdf", "logo-final.svg", "launch-notes.md"].map((f) => (
            <li key={f} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
              <FileText className="size-3.5 text-muted-foreground" /> {f}
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="flex w-56 flex-col items-center gap-2 p-6 text-center">
      <CheckCircle2 className="size-8 text-emerald-500" />
      <p className="text-sm font-semibold text-foreground">All uploaded</p>
      <p className="text-xs text-muted-foreground">Your team can see them now.</p>
    </div>
  );
}

export default function Demo(p: Record<string, unknown>) {
  const [step, setStep] = useState<Step>("Upload");

  return (
    <div className="flex flex-col items-center gap-6">
      <div role="tablist" aria-label="Step" className="flex gap-1 rounded-full border border-border bg-card p-1">
        {STEPS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={step === s}
            onClick={() => setStep(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${step === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <SizeShift {...p} contentKey={step} className="rounded-2xl border border-border bg-card shadow-xl">
        <Content step={step} />
      </SizeShift>
    </div>
  );
}
