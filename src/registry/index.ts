// Server-safe registry API. Entries come from src/registry/items/<slug>/meta.ts,
// collected by scripts/gen-registry.mjs (runs automatically before dev/build).
import { registry } from "./generated/metas";
import { CATEGORIES, categoryLabel, defaultProps, type Category, type LiteEntry, type NavEntry, type RegistryEntry } from "./types";

export { registry, CATEGORIES, categoryLabel, defaultProps };
export type { Category, LiteEntry, NavEntry, RegistryEntry };
export type { Meta, PropDef } from "./types";

export const bySlug = new Map(registry.map((e) => [e.slug, e]));

/** PascalCase export name, e.g. "letter-rise" -> "LetterRise". */
export const exportName = (slug: string) =>
  slug.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

export const inCategory = (id: Category) => registry.filter((e) => e.category === id);

/** Slim list for grids and search (server side; pass to client components as props). */
export const liteRegistry: LiteEntry[] = registry.map(({ slug, name, category, description, isNew }) => ({ slug, name, category, description, isNew }));

/** Even slimmer: what the sidebar needs. */
export const navRegistry: NavEntry[] = registry.map(({ slug, name, category, isNew }) => ({ slug, name, category, isNew }));
