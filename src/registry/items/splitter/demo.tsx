"use client";

import { Splitter } from "./splitter";

const files = [
  { name: "app", dir: true, depth: 0 },
  { name: "layout.tsx", depth: 1 },
  { name: "page.tsx", depth: 1, active: true },
  { name: "components", dir: true, depth: 0 },
  { name: "hero.tsx", depth: 1 },
  { name: "pricing.tsx", depth: 1 },
  { name: "lib", dir: true, depth: 0 },
  { name: "utils.ts", depth: 1 },
  { name: "package.json", depth: 0 },
];

const code: [string, string][][] = [
  [["text-violet-400", "import"], ["", " { Hero } "], ["text-violet-400", "from"], ["text-emerald-300", ' "@/components/hero"'], ["", ";"]],
  [["text-violet-400", "import"], ["", " { Pricing } "], ["text-violet-400", "from"], ["text-emerald-300", ' "@/components/pricing"'], ["", ";"]],
  [],
  [["text-violet-400", "export default function"], ["text-sky-300", " Page"], ["", "() {"]],
  [["text-violet-400", "  return"], ["", " ("]],
  [["text-muted-foreground", "    <"], ["text-rose-300", "main"], ["text-amber-200", " className"], ["", "="], ["text-emerald-300", '"grid gap-24"'], ["text-muted-foreground", ">"]],
  [["text-muted-foreground", "      <"], ["text-sky-300", "Hero"], ["text-amber-200", " title"], ["", "="], ["text-emerald-300", '"Ship faster"'], ["text-muted-foreground", " />"]],
  [["text-muted-foreground", "      <"], ["text-sky-300", "Pricing"], ["text-amber-200", " plans"], ["", "={"], ["text-orange-300", "3"], ["", "}"], ["text-muted-foreground", " />"]],
  [["text-muted-foreground", "    </"], ["text-rose-300", "main"], ["text-muted-foreground", ">"]],
  [["", "  );"]],
  [["", "}"]],
];

const Explorer = () => (
  <div className="h-full bg-muted/40 p-3 font-mono text-[12.5px]">
    <p className="mb-2 px-2 text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-muted-foreground">Explorer</p>
    {files.map((f) => (
      <div
        key={f.name}
        className={`truncate rounded-md px-2 py-1 ${f.active ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
        style={{ paddingLeft: 8 + f.depth * 14 }}
      >
        {f.dir ? "▾ " : ""}
        {f.name}
      </div>
    ))}
  </div>
);

const Editor = () => (
  <div className="h-full bg-card">
    <div className="flex h-9 items-center gap-2 border-b border-border px-3 text-xs">
      <span className="rounded-md bg-foreground/10 px-2 py-1 font-mono text-foreground">page.tsx</span>
      <span className="font-mono text-muted-foreground">layout.tsx</span>
    </div>
    <pre className="p-4 font-mono text-[12.5px] leading-6 text-foreground">
      {code.map((line, i) => (
        <div key={i} className="flex whitespace-pre">
          <span className="mr-4 w-5 select-none text-right text-muted-foreground/50">{i + 1}</span>
          {line.map(([c, t], j) => (
            <span key={j} className={c}>
              {t}
            </span>
          ))}
        </div>
      ))}
    </pre>
  </div>
);

const Terminal = () => (
  <div className="h-full bg-background p-4 font-mono text-[12px] leading-6">
    <p className="mb-1 text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-muted-foreground">Terminal</p>
    <p className="text-muted-foreground">
      <span className="text-emerald-400">➜</span> <span className="text-sky-300">~/site</span> npm run dev
    </p>
    <p className="text-foreground">▲ Next.js 16 ready on http://localhost:3000</p>
    <p className="text-emerald-400">✓ Compiled /page in 184ms</p>
  </div>
);

export default function Demo(p: Record<string, unknown>) {
  const outer = (p.direction as string) === "vertical" ? "vertical" : "horizontal";
  return (
    <div className="h-[26rem] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <Splitter
        start={<Explorer />}
        end={
          <Splitter
            direction={outer === "horizontal" ? "vertical" : "horizontal"}
            defaultSize={68}
            minSize={30}
            maxSize={90}
            label="Resize editor and terminal"
            start={<Editor />}
            end={<Terminal />}
          />
        }
        {...p}
      />
    </div>
  );
}
