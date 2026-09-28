import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { codeToHtml } from "shiki";

// Read at build time only: every caller is statically generated.
export const readSource = (slug: string) =>
  readFile(path.join(process.cwd(), "src/registry/items", slug, `${slug}.tsx`), "utf8");

// Both themes are emitted as CSS variables; globals.css picks one per site theme.
export const highlight = (code: string, lang: "tsx" | "bash" = "tsx") =>
  codeToHtml(code, { lang, themes: { light: "github-light", dark: "vesper" }, defaultColor: false });
