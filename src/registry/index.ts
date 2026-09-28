// Server-safe registry API. Entries come from src/registry/items/<slug>/meta.ts,
// collected by scripts/gen-registry.mjs (runs automatically before dev/build).
import { registry } from "./generated/metas";
import { CATEGORIES, type Category, type RegistryEntry } from "./types";

export { registry, CATEGORIES };
export type { Category, RegistryEntry };
export type { Meta, PropDef } from "./types";

export const bySlug = new Map(registry.map((e) => [e.slug, e]));

/** PascalCase export name, e.g. "split-text" -> "SplitText". */
export const exportName = (slug: string) =>
  slug.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

export const categoryLabel = (id: Category) => CATEGORIES.find((c) => c.id === id)!.label;

export const inCategory = (id: Category) => registry.filter((e) => e.category === id);

export function defaultProps(entry: RegistryEntry) {
  return Object.fromEntries(
    entry.props.filter((p) => p.default !== undefined).map((p) => [p.name, p.default]),
  ) as Record<string, unknown>;
}
