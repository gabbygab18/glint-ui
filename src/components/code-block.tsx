import { highlight } from "@/lib/source";
import { CopyButton } from "./copy-button";

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
  const html = await highlight(code, lang);
  return (
    <div className={`relative rounded-xl border border-border bg-card ${className ?? ""}`}>
      <CopyButton value={code} slug={slug} className="absolute right-3 top-3 z-10" />
      <div className="code max-h-[32rem] overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
