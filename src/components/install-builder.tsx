"use client";

import { ArrowRight, Check, Copy } from "@/components/site-icons";
import Link from "next/link";
import { useState } from "react";
import { REGISTRY_NAMESPACE } from "@/lib/site";
import { useToast } from "@/registry/items/toast/toast";

export interface BuilderItem {
  slug: string;
  name: string;
  dependencies: string[];
}

const MANAGERS = [
  { id: "npm", run: "npx shadcn@latest add" },
  { id: "pnpm", run: "pnpm dlx shadcn@latest add" },
  { id: "yarn", run: "yarn dlx shadcn@latest add" },
  { id: "bun", run: "bunx --bun shadcn@latest add" },
] as const;

function Radio({ on }: { on: boolean }) {
  return (
    <span className={`grid size-4 shrink-0 place-items-center rounded-full border-2 ${on ? "border-foreground" : "border-border"}`}>
      {on && <span className="size-1.5 rounded-full bg-foreground" />}
    </span>
  );
}

/** Pick components and a package manager; the dark panel builds the exact install command. */
export function InstallBuilder({ items }: { items: BuilderItem[] }) {
  const [picked, setPicked] = useState<string[]>(items.slice(0, 2).map((i) => i.slug));
  const [pm, setPm] = useState<(typeof MANAGERS)[number]["id"]>("npm");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const chosen = items.filter((i) => picked.includes(i.slug));
  const deps = [...new Set(chosen.flatMap((i) => i.dependencies))].sort();
  const run = MANAGERS.find((m) => m.id === pm)!.run;
  const command = chosen.length ? `${run} ${chosen.map((i) => `${REGISTRY_NAMESPACE}/${i.slug}`).join(" ")}` : "";

  const toggle = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      toast({ title: "Could not copy", description: "Your browser blocked clipboard access.", variant: "error" });
      return;
    }
    setCopied(true);
    toast({ id: "copied", title: "Command copied", variant: "success", duration: 1800 });
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-xl lg:grid-cols-[1.15fr_0.85fr]">
      <div className="p-6 sm:p-9">
        <p className="text-sm font-medium text-muted-foreground">Which components do you need?</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((i) => {
            const on = picked.includes(i.slug);
            return (
              <button
                key={i.slug}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(i.slug)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  on ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {on && <Check className="size-3.5" strokeWidth={3} />}
                {i.name}
              </button>
            );
          })}
        </div>

        <p className="mt-9 text-sm font-medium text-muted-foreground">Which package manager?</p>
        <div role="radiogroup" aria-label="Package manager" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MANAGERS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={pm === m.id}
              onClick={() => setPm(m.id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                pm === m.id ? "border-foreground bg-muted/60" : "hover:border-foreground/40"
              }`}
            >
              {m.id}
              <Radio on={pm === m.id} />
            </button>
          ))}
        </div>
      </div>

      <div
        className="dark flex flex-col p-6 text-white sm:p-9"
        style={{ background: "radial-gradient(500px circle at 100% 0%, oklch(0.42 0.12 128 / 0.5), transparent 60%), linear-gradient(160deg, oklch(0.23 0.035 128), oklch(0.15 0.02 125))" }}
      >
        <p className="text-sm text-white/70">Your install command</p>
        <p className="mt-3 min-h-[4.5rem] break-words font-mono text-[15px] leading-relaxed text-[#d9ff6b]" aria-live="polite">
          {command || <span className="text-white/40">Pick at least one component</span>}
        </p>

        <dl className="mt-6 divide-y divide-white/10 text-sm">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-white/70">Components</dt>
            <dd className="font-semibold">{chosen.length}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-white/70">npm packages</dt>
            <dd className="text-right font-semibold">{deps.length ? deps.join(", ") : "None"}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-white/70">Files added</dt>
            <dd className="font-semibold">{chosen.length ? `${chosen.length} in components/ui` : "None"}</dd>
          </div>
        </dl>

        <button
          type="button"
          disabled={!command}
          onClick={copy}
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#d9ff6b] py-2 pl-5 pr-2 text-sm font-semibold text-[#141a0f] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy command"}
          <span className="grid size-7 place-items-center rounded-full bg-[#141a0f] text-[#d9ff6b]">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </span>
        </button>
        <p className="mt-4 text-xs leading-relaxed text-white/50">
          The shadcn CLI copies each file into your project, where you can read and change it.{" "}
          <Link href="/docs/installation" className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-white">
            Setup guide <ArrowRight className="size-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
