"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight, File, FileCode, FileImage, FileJson, FileText, Folder, FolderOpen } from "lucide-react";

export interface TreeNode {
  id: string;
  name: string;
  /** Present (even empty) = folder. */
  children?: TreeNode[];
  /** Override the default icon. */
  icon?: ReactNode;
}

export interface FolderTreeProps {
  data: TreeNode[];
  /** Folder ids open at first render. */
  defaultExpanded?: string[];
  /** Node id selected at first render. */
  defaultSelected?: string;
  /** Px of indent per level. */
  indent?: number;
  /** Draw vertical guide lines for nesting. */
  showLines?: boolean;
  /** Tint folder icons. */
  folderColor?: string;
  onSelect?: (node: TreeNode, path: TreeNode[]) => void;
  /** Accessible name for the tree. */
  label?: string;
  className?: string;
}

const FILE_ICONS: [RegExp, typeof File, string][] = [
  [/\.(tsx?|jsx?|mjs)$/, FileCode, "#60a5fa"],
  [/\.json$/, FileJson, "#fbbf24"],
  [/\.(md|mdx|txt)$/, FileText, "#a1a1aa"],
  [/\.(png|jpe?g|svg|gif|webp|ico)$/, FileImage, "#f472b6"],
  [/\.(css|scss)$/, FileCode, "#c084fc"],
];

type Row = { node: TreeNode; depth: number; parent: string | null; path: TreeNode[] };

/** Visible rows in display order (children of collapsed folders are skipped). */
function flatten(nodes: TreeNode[], open: Set<string>, depth = 0, parent: string | null = null, path: TreeNode[] = [], out: Row[] = []) {
  for (const node of nodes) {
    const p = [...path, node];
    out.push({ node, depth, parent, path: p });
    if (node.children && open.has(node.id)) flatten(node.children, open, depth + 1, node.id, p, out);
  }
  return out;
}

/**
 * A file tree with springy expand/collapse, a highlight that glides to the selected row,
 * file-type icons and full WAI-ARIA tree keyboard support (arrows, Home/End, Enter, type-ahead).
 */
export function FolderTree({
  data,
  defaultExpanded = [],
  defaultSelected,
  indent = 16,
  showLines = true,
  folderColor = "#7dd3fc",
  onSelect,
  label = "Files",
  className,
}: FolderTreeProps) {
  const [open, setOpen] = useState(() => new Set(defaultExpanded));
  const [selected, setSelected] = useState(defaultSelected);
  const [focused, setFocused] = useState<string | undefined>(defaultSelected);
  const reduce = useReducedMotion();
  const uid = useId();
  const items = useRef(new Map<string, HTMLLIElement>());
  const rows = useMemo(() => flatten(data, open), [data, open]);
  const tabStop = rows.some((r) => r.node.id === focused) ? focused : rows[0]?.node.id;

  const toggle = (id: string, to?: boolean) =>
    setOpen((s) => {
      const next = new Set(s);
      if (to ?? !next.has(id)) next.add(id);
      else next.delete(id);
      return next;
    });

  const focus = (id: string | undefined) => {
    if (!id) return;
    setFocused(id);
    items.current.get(id)?.focus();
  };

  const select = (row: Row) => {
    setSelected(row.node.id);
    setFocused(row.node.id);
    if (row.node.children) toggle(row.node.id);
    onSelect?.(row.node, row.path);
  };

  const onKey = (e: KeyboardEvent) => {
    const i = rows.findIndex((r) => r.node.id === tabStop);
    const row = rows[i];
    if (!row) return;
    const isOpen = open.has(row.node.id);
    const folder = !!row.node.children;
    let handled = true;
    switch (e.key) {
      case "ArrowDown":
        focus(rows[i + 1]?.node.id);
        break;
      case "ArrowUp":
        focus(rows[i - 1]?.node.id);
        break;
      case "ArrowRight":
        if (folder && !isOpen) toggle(row.node.id, true);
        else if (folder && row.node.children?.length) focus(rows[i + 1]?.node.id);
        break;
      case "ArrowLeft":
        if (folder && isOpen) toggle(row.node.id, false);
        else focus(row.parent ?? undefined);
        break;
      case "Home":
        focus(rows[0]?.node.id);
        break;
      case "End":
        focus(rows[rows.length - 1]?.node.id);
        break;
      case "Enter":
      case " ":
        select(row);
        break;
      default:
        // Type-ahead: jump to the next visible item starting with the typed character.
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const k = e.key.toLowerCase();
          const order = [...rows.slice(i + 1), ...rows.slice(0, i + 1)];
          focus(order.find((r) => r.node.name.toLowerCase().startsWith(k))?.node.id);
        } else handled = false;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce: 0.15, duration: 0.4 };

  const renderLevel = (nodes: TreeNode[], depth: number, path: TreeNode[]): ReactNode =>
    nodes.map((node) => {
      const folder = !!node.children;
      const isOpen = folder && open.has(node.id);
      const on = selected === node.id;
      const row: Row = { node, depth, parent: path[path.length - 1]?.id ?? null, path: [...path, node] };
      const match = FILE_ICONS.find(([re]) => re.test(node.name));
      const Icon = folder ? (isOpen ? FolderOpen : Folder) : (match?.[1] ?? File);
      const tint = folder ? folderColor : (match?.[2] ?? "#a1a1aa");
      return (
        <li
          key={node.id}
          ref={(el) => {
            if (el) items.current.set(node.id, el);
            else items.current.delete(node.id);
          }}
          role="treeitem"
          aria-level={depth + 1}
          aria-expanded={folder ? isOpen : undefined}
          aria-selected={on}
          tabIndex={tabStop === node.id ? 0 : -1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) setFocused(node.id);
          }}
          className="outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-ring"
        >
          <div
            onClick={() => select(row)}
            className={`relative flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-lg pr-3 text-sm transition-colors ${
              on ? "text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            style={{ paddingLeft: depth * indent + 6 }}
          >
            {on && (
              <motion.span
                layoutId={`${uid}-sel`}
                transition={spring}
                className="absolute inset-0 rounded-lg bg-muted shadow-[inset_0_0_0_1px_var(--border)]"
              />
            )}
            <span className="relative grid size-4 shrink-0 place-items-center">
              {folder && (
                <motion.span initial={false} animate={{ rotate: isOpen ? 90 : 0 }} transition={spring} className="grid">
                  <ChevronRight className="size-3.5" />
                </motion.span>
              )}
            </span>
            <Icon className="relative size-4 shrink-0" style={{ color: tint }} fill={folder ? `color-mix(in srgb, ${tint} 22%, transparent)` : "none"} />
            <span className="relative truncate">{node.name}</span>
          </div>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.ul
                role="group"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.32 }}
                className="relative overflow-hidden"
              >
                {showLines && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-1 w-px bg-border"
                    style={{ left: depth * indent + 14 }}
                  />
                )}
                {node.children!.length ? (
                  renderLevel(node.children!, depth + 1, row.path)
                ) : (
                  <li role="none" className="h-8 py-1.5 text-xs italic text-muted-foreground/70" style={{ paddingLeft: (depth + 1) * indent + 28 }}>
                    Empty
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      );
    });

  return (
    <ul role="tree" aria-label={label} onKeyDown={onKey} className={`flex flex-col text-foreground ${className ?? ""}`}>
      {renderLevel(data, 0, [])}
    </ul>
  );
}
