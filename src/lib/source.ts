import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { codeToHtml } from "shiki";

// Read at build time only: every caller is statically generated.
export const readSource = (slug: string) =>
  readFile(path.join(process.cwd(), "src/registry/items", slug, `${slug}.tsx`), "utf8");

const TOKEN = /style="--shiki-light:#([0-9a-fA-F]{3,8});--shiki-dark:#([0-9a-fA-F]{3,8})"/g;

/**
 * Highlighted HTML plus the CSS for its colors. Shiki writes both theme colors inline on every
 * token; here each light/dark pair becomes one short class instead (named after its colors, so
 * the same pair gets the same class in every block), which roughly halves the page payload.
 */
export async function highlight(code: string, lang: "tsx" | "bash" = "tsx") {
  const raw = await codeToHtml(code, { lang, themes: { light: "github-light", dark: "vesper" }, defaultColor: false });
  const rules = new Map<string, string>();
  const html = raw.replace(TOKEN, (_, light: string, dark: string) => {
    const cls = `c${light}${dark}`;
    rules.set(cls, `.code .${cls}{color:#${light}}.dark .code .${cls}{color:#${dark}}`);
    return `class="${cls}"`;
  });
  return { html, css: [...rules.values()].join("") };
}
