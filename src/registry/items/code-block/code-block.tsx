"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Highlighted lines sweep their tint in from the left, staggered by line.
const css = `
@keyframes ui-code-hl{from{scale:0 1;opacity:0}}
.ui-code-hl::before{content:"";position:absolute;inset:0;z-index:-1;transform-origin:left;background:color-mix(in oklab,var(--primary) 12%,transparent);box-shadow:inset 2px 0 var(--primary);animation:ui-code-hl .6s cubic-bezier(.6,0,.2,1) both;animation-delay:calc(var(--i)*40ms + .15s)}
@media (prefers-reduced-motion:reduce){.ui-code-hl::before{animation:none}}
`;

type TokenType = "plain" | "comment" | "string" | "number" | "keyword" | "function" | "type" | "tag" | "attr" | "punct";
type Token = [TokenType, string];

const tokenClass: Record<TokenType, string> = {
  plain: "",
  comment: "text-muted-foreground italic",
  string: "text-emerald-700 dark:text-emerald-300",
  number: "text-amber-700 dark:text-amber-300",
  keyword: "text-violet-600 dark:text-violet-300",
  function: "text-sky-700 dark:text-sky-300",
  type: "text-rose-600 dark:text-rose-300",
  tag: "text-rose-600 dark:text-rose-300",
  attr: "text-orange-700 dark:text-orange-300",
  punct: "text-muted-foreground",
};

const KEYWORDS = new Set(
  (
    "import export from default as const let var function return if else for while do switch case break continue new " +
    "class extends interface type enum implements public private protected readonly static async await yield try catch " +
    "finally throw typeof instanceof in of void delete this super true false null undefined keyof satisfies " +
    "echo cd sudo npm npx pnpm yarn bun git def self None True False lambda pass with elif print"
  ).split(" "),
);

// One pass, one regex: comments | strings | numbers | JSX tag opener | identifiers | punctuation.
// Good enough to color TS/JS/JSX, CSS, JSON, shell and Python readably; not a real parser.
const REST =
  /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?(?:px|rem|em|ms|s|%)?\b)|(<\/?[A-Za-z][\w.-]*)|([A-Za-z_$][\w$-]*)|([{}()[\];,.:=+\-*/%!?&|<>~^@#]+)/
    .source;
const SLASH_RE = new RegExp(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|/.source + REST, "g");
const HASH_RE = new RegExp(/((?<!\S)#[^\n]*)|/.source + REST, "g");

function tokenize(code: string, language: string): Token[] {
  const out: Token[] = [];
  const hashComments = /^(bash|sh|shell|zsh|py|python|yaml|yml)$/.test(language);
  const keyed = /^(css|scss|json|ya?ml)$/.test(language);
  let last = 0;
  for (const m of code.matchAll(hashComments ? HASH_RE : SLASH_RE)) {
    const i = m.index;
    if (i > last) out.push(["plain", code.slice(last, i)]);
    const [text, comment, str, num, tag, ident] = m;
    const after = code.slice(i + text.length);
    let type: TokenType = "punct";
    if (comment) type = "comment";
    else if (str) type = keyed && /^\s*:/.test(after) ? "attr" : "string";
    else if (num) type = "number";
    else if (tag) {
      out.push(["punct", text.startsWith("</") ? "</" : "<"]);
      out.push(["tag", text.replace(/^<\/?/, "")]);
      last = i + text.length;
      continue;
    } else if (ident) {
      if (KEYWORDS.has(ident)) type = "keyword";
      else if (/^=["'{]/.test(after) || (keyed && /^\s*:/.test(after))) type = "attr";
      else if (/^\s*\(/.test(after)) type = "function";
      else if (/^[A-Z]/.test(ident)) type = "type";
      else type = "plain";
    }
    out.push([type, text]);
    last = i + text.length;
  }
  if (last < code.length) out.push(["plain", code.slice(last)]);
  return out;
}

/** Splits tokens at newlines so multi-line comments/strings still color each line. */
function toLines(tokens: Token[]) {
  const lines: Token[][] = [[]];
  for (const [type, text] of tokens) {
    text.split("\n").forEach((part, k) => {
      if (k > 0) lines.push([]);
      if (part) lines[lines.length - 1].push([type, part]);
    });
  }
  return lines;
}

/** "2,4-6" or [2,4,5,6] -> Set of 1-based line numbers. */
function parseLines(spec: string | number[] | undefined) {
  const set = new Set<number>();
  if (Array.isArray(spec)) spec.forEach((n) => set.add(n));
  else
    for (const part of (spec ?? "").split(",")) {
      const [a, b = a] = part.split("-").map((s) => parseInt(s, 10));
      if (!Number.isNaN(a)) for (let n = a; n <= (Number.isNaN(b) ? a : b); n++) set.add(n);
    }
  return set;
}

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  code: string;
  /** Used for token rules and the header badge: tsx, ts, js, css, json, bash, python... */
  language?: string;
  /** Shown as a tab in the header. */
  filename?: string;
  showLineNumbers?: boolean;
  /** Lines to highlight, 1-based: "3" | "2,5-7" | [2, 5, 6, 7]. */
  highlightLines?: string | number[];
  /** Show the copy button. */
  copyable?: boolean;
}

export function CodeBlock({
  code,
  language = "tsx",
  filename,
  showLineNumbers = true,
  highlightLines,
  copyable = true,
  className,
  ...props
}: CodeBlockProps) {
  const lines = useMemo(() => toLines(tokenize(code.replace(/\n$/, ""), language)), [code, language]);
  const marked = useMemo(() => parseLines(highlightLines), [highlightLines]);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return; // clipboard blocked (insecure context / permissions): leave the icon as is
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  let hlIndex = 0;
  return (
    <figure
      {...props}
      className={cn(
        "group/code relative w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <style href="ui-code-block" precedence="default">
        {css}
      </style>
      <div className="flex h-11 items-center justify-between gap-2 border-b border-border bg-muted/40 pr-2">
        {filename ? (
          <figcaption className="relative flex h-full items-center gap-2 border-r border-border bg-card px-4 text-xs font-medium text-foreground">
            <FileCode2 aria-hidden className="size-3.5 text-muted-foreground" />
            {filename}
            <span aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-card" />
            <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
          </figcaption>
        ) : (
          <span className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">{language}</span>
        )}
        <div className="flex items-center gap-2">
          {filename && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              {language}
            </span>
          )}
          {copyable && (
            <MotionConfig reducedMotion="user">
              <button
                type="button"
                onClick={copy}
                aria-label={copied ? "Copied" : "Copy code"}
                className={cn(
                  "relative grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
                  copied && "text-emerald-600 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={copied ? "check" : "copy"}
                    initial={{ opacity: 0, scale: 0.4, rotate: copied ? -45 : 45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="grid place-items-center"
                  >
                    {copied ? <Check className="size-4" strokeWidth={2.5} /> : <Copy className="size-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span aria-live="polite" className="sr-only">
                {copied ? "Copied to clipboard" : ""}
              </span>
            </MotionConfig>
          )}
        </div>
      </div>
      <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6" tabIndex={0}>
        <code className="grid min-w-max">
          {lines.map((line, n) => {
            const hl = marked.has(n + 1);
            return (
              <span
                key={n}
                data-highlighted={hl || undefined}
                className={cn("relative isolate flex pr-6", hl && "ui-code-hl", !showLineNumbers && "pl-4")}
                style={hl ? ({ "--i": hlIndex++ } as CSSProperties) : undefined}
              >
                {showLineNumbers && (
                  <span
                    aria-hidden
                    className={cn(
                      "w-12 shrink-0 pr-4 text-right text-muted-foreground/50 tabular-nums select-none",
                      hl && "text-primary",
                    )}
                  >
                    {n + 1}
                  </span>
                )}
                <span>
                  {line.length ? line.map(([t, text], k) => (t === "plain" ? text : <span key={k} className={tokenClass[t]}>{text}</span>)) : " "}
                </span>
              </span>
            );
          })}
        </code>
      </pre>
    </figure>
  );
}
