import { registry } from "@/registry";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Registry index in the shadcn registry.json format (used by the shadcn directory).
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: SITE_NAME.toLowerCase().replace(/\s+/g, "-"),
    homepage: SITE_URL,
    items: registry.map((e) => ({
      name: e.slug,
      type: "registry:ui",
      title: e.name,
      description: e.description,
      dependencies: e.dependencies ?? [],
      files: [{ path: `registry/ui/${e.slug}.tsx`, type: "registry:ui" }],
    })),
  });
}
