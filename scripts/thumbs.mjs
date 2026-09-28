// Captures public/thumbs/<slug>.webp for every registry item from /preview/<slug>.
// usage: node scripts/thumbs.mjs [baseUrl=http://localhost:3000] [slug...]
// Needs a running server (next dev or next start).
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const [base = "http://localhost:3000", ...only] = process.argv.slice(2);
const slugs = only.length ? only : readdirSync(path.join(root, "src/registry/items"));
const outDir = path.join(root, "public/thumbs");
mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const slug of slugs) {
  try {
    execFileSync(
      "node",
      [path.join(root, "scripts/shot.mjs"), `${base}/preview/${slug}`, path.join(outDir, `${slug}.webp`), "960", "600", "3000", "480,300"],
      { stdio: "pipe" },
    );
    console.log(`ok   ${slug}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${slug}: ${String(e.stdout ?? e.message).trim().split("\n")[0]}`);
  }
}
console.log(`${slugs.length - failed}/${slugs.length} thumbnails`);
