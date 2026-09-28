import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { ComponentMeta } from "@/components/component-meta";
import { Playground } from "@/components/playground";
import { PromoCard, RightRail, Toc } from "@/components/right-rail";
import { Tabs } from "@/components/tabs";
import { bySlug, categoryLabel, exportName, registry } from "@/registry";
import { readSource } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const entry = bySlug.get((await params).slug);
  return entry ? { title: entry.name, description: entry.description } : {};
}

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="mb-4 mt-14 scroll-mt-24 font-display text-2xl font-bold">
    {children}
  </h2>
);

export default async function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  const { slug } = await params;
  const entry = bySlug.get(slug);
  if (!entry) notFound();

  const source = await readSource(slug);
  const index = registry.indexOf(entry);
  const prev = registry[index - 1];
  const next = registry[index + 1];
  const deps = entry.dependencies ?? [];
  const usesUtils = source.includes("@/lib/utils");
  const usage = `import { ${exportName(slug)} } from "@/components/ui/${slug}";\n\n${entry.usage}`;

  return (
    <>
      <main className="min-w-0 flex-1 py-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/components" className="hover:text-foreground">
            Components
          </Link>
          <span aria-hidden>/</span>
          <span>{categoryLabel(entry.category)}</span>
        </nav>
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{entry.name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{entry.description}</p>
            {entry.credit && (
              <p className="mt-3 text-sm text-muted-foreground">
                Credit:{" "}
                <a href={entry.credit.url} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">
                  {entry.credit.label}
                </a>
                {entry.credit.license && ` (${entry.credit.license})`}
              </p>
            )}
          </div>
          <ComponentMeta slug={slug} />
        </div>

        <section id="preview" className="scroll-mt-24">
          <Tabs
            label="Preview or code"
            tabs={[
              { label: "Preview", content: <Playground slug={slug} /> },
              { label: "Code", content: <CodeBlock code={source} slug={slug} /> },
            ]}
          />
        </section>

        <H2 id="installation">Installation</H2>
        <Tabs
          label="Installation method"
          tabs={[
            {
              label: "CLI",
              content: <CodeBlock code={`npx shadcn@latest add ${SITE_URL}/r/${slug}.json`} lang="bash" slug={slug} />,
            },
            {
              label: "Manual",
              content: (
                <ol className="space-y-5 text-sm text-muted-foreground">
                  {deps.length > 0 && (
                    <li>
                      <p className="mb-2">1. Install the dependencies:</p>
                      <CodeBlock code={`npm install ${deps.join(" ")}`} lang="bash" />
                    </li>
                  )}
                  {usesUtils && (
                    <li>
                      <p className="mb-2">
                        {deps.length ? "2" : "1"}. Add the <code className="text-foreground">cn</code> helper at{" "}
                        <code className="text-foreground">lib/utils.ts</code> (shadcn projects already have it):
                      </p>
                      <CodeBlock
                        code={`import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`}
                      />
                    </li>
                  )}
                  <li>
                    <p className="mb-2">
                      Copy the source into <code className="text-foreground">components/ui/{slug}.tsx</code>:
                    </p>
                    <CodeBlock code={source} slug={slug} />
                  </li>
                </ol>
              ),
            },
          ]}
        />

        <H2 id="usage">Usage</H2>
        <CodeBlock code={usage} />

        <H2 id="props">Props</H2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Prop</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Default</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {[...entry.props, { name: "className", type: "string" as const, description: "Extra classes for the root element." }].map(
                (p) => (
                  <tr key={p.name} className="border-t align-top">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.type === "select"
                        ? p.options.map((o) => `"${o}"`).join(" | ")
                        : p.type === "list"
                          ? "string[]"
                          : p.type === "node"
                            ? "ReactNode"
                            : p.type === "color"
                              ? "string"
                              : p.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {"default" in p && p.default !== undefined ? JSON.stringify(p.default) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <nav aria-label="Pagination" className="mt-14 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/components/${prev.slug}`} className="rounded-2xl border p-4 hover:bg-muted">
              <span className="text-xs text-muted-foreground">Previous</span>
              <span className="block font-display font-semibold">← {prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/components/${next.slug}`} className="rounded-2xl border p-4 text-right hover:bg-muted">
              <span className="text-xs text-muted-foreground">Next</span>
              <span className="block font-display font-semibold">{next.name} →</span>
            </Link>
          )}
        </nav>
      </main>
      <RightRail>
        <Toc
          items={[
            { id: "preview", label: "Preview" },
            { id: "installation", label: "Installation" },
            { id: "usage", label: "Usage" },
            { id: "props", label: "Props" },
          ]}
        />
        <PromoCard />
      </RightRail>
    </>
  );
}
