"use client";

import { Suspense, useState } from "react";
import { demos } from "@/registry/generated/demos";
import { ErrorBoundary } from "./error-boundary";
import { Fit } from "./fit";
import { Checkbox } from "@/registry/items/checkbox/checkbox";
import { Input } from "@/registry/items/input/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/items/popover/popover";
import { Select } from "@/registry/items/select/select";
import { Slider } from "@/registry/items/slider/slider";
import { bySlug, defaultProps, type PropDef } from "@/registry";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/registry/items/button/button";

export function Playground({ slug }: { slug: string }) {
  const entry = bySlug.get(slug)!;
  const Demo = demos[slug];
  const [values, setValues] = useState(() => defaultProps(entry));
  const [run, setRun] = useState(0);
  const controls = entry.props.filter((p) => p.control !== false && p.type !== "node");

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  return (
    <div className="overflow-hidden rounded-3xl border">
      {/* The stage is always dark: most effects are designed for dark surfaces. */}
      <div className="dark relative grid min-h-[28rem] place-items-center overflow-hidden bg-[oklch(0.13_0.004_110)] bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] p-8 text-foreground [background-size:16px_16px]">
        <Suspense fallback={<div className="size-6 animate-spin rounded-full border-2 border-border border-t-primary" aria-label="Loading preview" />}>
          {/* Changing the key remounts the demo: replays entrance animations and resets canvases. */}
          <ErrorBoundary key={run}>
            <Fit>
              <Demo {...values} />
            </Fit>
          </ErrorBoundary>
        </Suspense>
        <div className="absolute right-3 top-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRun((r) => r + 1)} startIcon={<RotateCcw />} className="bg-card/80 backdrop-blur">
            Replay
          </Button>
          <a href={`/preview/${slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm", className: "bg-card/80 backdrop-blur" })}>
            Open <ArrowUpRight />
          </a>
          {controls.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setValues(defaultProps(entry));
                setRun((r) => r + 1);
              }}
              className="bg-card/80 backdrop-blur"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {controls.length > 0 && (
        <fieldset key={run} className="grid gap-x-6 gap-y-4 border-t bg-card p-5 sm:grid-cols-2">
          <legend className="sr-only">Customize</legend>
          {controls.map((p) => (
            <Control key={p.name} def={p} value={values[p.name]} onChange={(v) => set(p.name, v)} />
          ))}
        </fieldset>
      )}
    </div>
  );
}

const PALETTE = [
  "#ffffff", "#e4e4e7", "#a1a1aa", "#52525b", "#27272a", "#09090b", "#c6ff3d", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#22d3ee", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a78bfa", "#d946ef", "#ec4899", "#f43f5e", "#ef4444", "#f97316", "#f59e0b", "#facc15",
];

// Playground controls are built from the registry's own primitives.
function ColorControl({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger aria-label="Choose a color" className="size-10 shrink-0 p-0">
          <span className="size-6 rounded-md border border-border" style={{ background: value }} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <div className="grid grid-cols-8 gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={c === value.toLowerCase()}
                onClick={() => onChange(c)}
                className="size-6 rounded-md border border-black/10 transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-ring aria-pressed:ring-offset-2 aria-pressed:ring-offset-popover"
                style={{ background: c }}
              />
            ))}
          </div>
          <p className="mb-1.5 mt-4 text-xs text-muted-foreground">Any CSS color</p>
          <Input size="sm" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} aria-label="Color value" />
        </PopoverContent>
      </Popover>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="flex-1" />
    </div>
  );
}

function Control({ def, value, onChange }: { def: PropDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = `ctl-${def.name}`;
  const label = (
    <label htmlFor={id} className="mb-2 flex justify-between font-mono text-xs text-muted-foreground">
      {def.name}
      {def.type === "number" && <span className="text-foreground">{String(value)}</span>}
    </label>
  );

  switch (def.type) {
    case "number":
      return (
        <div>
          {label}
          <Slider
            value={[Number(value ?? def.min)]}
            onValueChange={([v]) => onChange(v)}
            min={def.min}
            max={def.max}
            step={def.step ?? 1}
            tooltip="never"
            thumbLabels={[def.name]}
          />
        </div>
      );
    case "boolean":
      return (
        <div className="self-end pb-2">
          <Checkbox
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            label={<span className="font-mono text-xs">{def.name}</span>}
          />
        </div>
      );
    case "select":
      return (
        <div>
          {label}
          <Select
            id={id}
            value={String(value)}
            onValueChange={onChange}
            options={def.options.map((o) => ({ value: o, label: o }))}
            className="w-full"
          />
        </div>
      );
    case "color":
      return (
        <div>
          {label}
          <ColorControl id={id} value={String(value ?? "")} onChange={onChange} />
        </div>
      );
    case "list":
      return (
        <div>
          {label}
          <Input
            id={id}
            defaultValue={((value as string[] | undefined) ?? []).join(", ")}
            onChange={(e) => onChange(e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
            spellCheck={false}
          />
        </div>
      );
    default:
      return (
        <div>
          {label}
          <Input id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
        </div>
      );
  }
}
