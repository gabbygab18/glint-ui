import { bySlug, registry } from "@/registry";
import { readSource } from "@/lib/source";

// shadcn registry items, prerendered at build:
//   npx shadcn@latest add https://<site>/r/split-text.json
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map((e) => ({ slug: `${e.slug}.json` }));
}

export async function GET(_req: Request, ctx: RouteContext<"/r/[slug]">) {
  const { slug: file } = await ctx.params;
  const entry = bySlug.get(file.replace(/\.json$/, ""));
  if (!entry) return new Response(null, { status: 404 });

  const content = await readSource(entry.slug);
  return Response.json({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.slug,
    type: "registry:ui",
    title: entry.name,
    description: entry.description,
    dependencies: entry.dependencies ?? [],
    // shadcn's built-in "utils" item provides the cn() helper.
    registryDependencies: content.includes("@/lib/utils") ? ["utils"] : [],
    files: [{ path: `registry/ui/${entry.slug}.tsx`, type: "registry:ui", content }],
  });
}
