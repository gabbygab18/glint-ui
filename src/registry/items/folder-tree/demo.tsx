"use client";

import { useState } from "react";
import { FolderTree, type TreeNode } from "./folder-tree";

const f = (id: string, children?: TreeNode[]): TreeNode => ({ id, name: id.split("/").pop()!, children });

const data: TreeNode[] = [
  f("src", [
    f("src/app", [f("src/app/layout.tsx"), f("src/app/page.tsx"), f("src/app/globals.css")]),
    f("src/components", [
      f("src/components/ui", [f("src/components/ui/button.tsx"), f("src/components/ui/dialog.tsx"), f("src/components/ui/tabs.tsx")]),
      f("src/components/navbar.tsx"),
      f("src/components/footer.tsx"),
    ]),
    f("src/lib", [f("src/lib/utils.ts"), f("src/lib/db.ts")]),
    f("src/hooks", []),
  ]),
  f("public", [f("public/logo.svg"), f("public/og-image.png")]),
  f("package.json"),
  f("tsconfig.json"),
  f("README.md"),
];

const snippet: Record<string, string[]> = {
  tsx: ['export default function Page() {', '  return (', '    <main className="grid">', "      <Hero />", "    </main>", "  );", "}"],
  ts: ['import { clsx } from "clsx";', "", "export function cn(...inputs) {", "  return twMerge(clsx(inputs));", "}"],
  css: ['@import "tailwindcss";', "", ":root {", "  --radius: 0.75rem;", "}"],
  json: ["{", '  "name": "acme-web",', '  "private": true,', '  "type": "module"', "}"],
};

export default function Demo(p: Record<string, unknown>) {
  const [path, setPath] = useState<string[]>(["src", "app", "page.tsx"]);
  const file = path[path.length - 1];
  const lines = snippet[file.split(".").pop() ?? ""];

  return (
    <div className="flex w-[min(44rem,100%)] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)]">
      <div className="max-h-[23rem] w-64 shrink-0 overflow-y-auto border-r border-border p-2">
        <p className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">acme-web</p>
        <FolderTree
          data={data}
          defaultExpanded={["src", "src/app", "src/components"]}
          defaultSelected="src/app/page.tsx"
          onSelect={(_, trail) => setPath(trail.map((n) => n.name))}
          {...p}
        />
      </div>
      <div className="hidden min-w-0 flex-1 flex-col sm:flex">
        <div className="flex items-center gap-1 border-b border-border px-4 py-3 text-xs text-muted-foreground">
          {path.map((seg, i) => (
            <span key={i} className={i === path.length - 1 ? "text-foreground" : ""}>
              {i > 0 && <span className="mx-1 opacity-50">/</span>}
              {seg}
            </span>
          ))}
        </div>
        <pre className="flex-1 p-4 font-mono text-[12.5px] leading-6 text-muted-foreground">
          {lines
            ? lines.map((l, i) => (
                <div key={i}>
                  <span className="mr-4 inline-block w-4 text-right opacity-40">{i + 1}</span>
                  <span className="text-foreground/85">{l}</span>
                </div>
              ))
            : "Select a file to preview it."}
        </pre>
      </div>
    </div>
  );
}
