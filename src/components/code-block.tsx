import { highlight } from "@/lib/source";
import { CopyButton } from "./copy-button";

// Small stable string hash (FNV-1a) to name each color stylesheet.
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
};

export async function CodeBlock({
  code,
  lang = "tsx",
  slug,
  className,
}: {
  code: string;
  lang?: "tsx" | "bash";
  /** Set to count copies of this component. */
  slug?: string;
  className?: string;
}) {
  const { html, css } = await highlight(code, lang);
  return (
    <div className={`relative rounded-xl border border-border bg-card ${className ?? ""}`}>
      {/* Token colors as a few short classes; React hoists this and drops duplicates by href. */}
      {css && (
        <style href={`code-${hash(css)}`} precedence="default">
          {css}
        </style>
      )}
      <CopyButton value={code} slug={slug} className="absolute right-3 top-3 z-10" />
      <div className="code max-h-[32rem] overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
