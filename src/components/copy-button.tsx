"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/items/button/button";
import { useToast } from "@/registry/items/toast/toast";
import { track } from "@/lib/stats";

export function CopyButton({ value, slug, className }: { value: string; slug?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      toast({ title: "Could not copy", description: "Your browser blocked clipboard access.", variant: "error" });
      return;
    }
    setCopied(true);
    toast({ id: "copied", title: "Copied to clipboard", variant: "success", duration: 1800 });
    if (slug) track(slug, "copy");
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copy}
      startIcon={copied ? <Check /> : <Copy />}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={className}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
