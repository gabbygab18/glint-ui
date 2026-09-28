"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

// Checkbox tick/dash are drawn by animating the stroke, same technique as the Checkbox primitive.
const css = `
.ui-tbl-mark path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .2s cubic-bezier(.6,0,.4,1)}
.ui-tbl-cbx:checked:not(:indeterminate)+.ui-tbl-mark .tick,.ui-tbl-cbx:indeterminate+.ui-tbl-mark .dash{stroke-dashoffset:0}
@media (prefers-reduced-motion:reduce){.ui-tbl-mark path{transition:none}}
`;

export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection } | null;

export interface TableColumn<T> {
  /** Field to read (and sort by, unless `sortValue` is given). */
  key: keyof T & string;
  header: ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  /** Custom cell renderer. */
  cell?: (row: T) => ReactNode;
  /** Value used for sorting when the displayed cell differs from the raw field. */
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface TableProps<T extends { id: string | number }> {
  columns: TableColumn<T>[];
  rows: T[];
  /** Checkbox column with select-all. On by default; pass `selectable={false}` for a plain table. */
  selectable?: boolean;
  selected?: (string | number)[];
  defaultSelected?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** Keep the header visible while the body scrolls (set `maxHeight`). */
  stickyHeader?: boolean;
  /** Scroll container height, e.g. 320 or "20rem". */
  maxHeight?: number | string;
  /** Visible caption; also names the table for screen readers. */
  caption?: ReactNode;
  /** Shown when there are no rows. */
  empty?: ReactNode;
  className?: string;
}

function Check({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  });
  return (
    <span className="relative grid size-4 place-items-center">
      <input
        ref={ref}
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={onChange}
        className={cn(
          "ui-tbl-cbx peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-[5px] border border-input bg-background outline-none",
          "transition-[background-color,border-color,scale] duration-200 hover:border-primary/60 active:scale-90",
          "checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
      />
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="ui-tbl-mark pointer-events-none relative size-3 text-primary-foreground">
        <path className="tick" pathLength={1} d="M4.5 12.5l5 5L19.5 7" />
        <path className="dash" pathLength={1} d="M6 12h12" />
      </svg>
    </span>
  );
}

/** Two stacked chevrons: the active one lights up; the pair flips for descending. */
function SortIcon({ state }: { state: SortDirection | undefined }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "size-3.5 shrink-0 transition-[rotate,opacity] duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none",
        state === "desc" && "rotate-180",
        state ? "opacity-100" : "opacity-40 group-hover/th:opacity-80",
      )}
    >
      <path d="M3 6l3-3 3 3" className={cn("transition-[translate] duration-300", state && "-translate-y-px")} stroke={state ? "var(--primary)" : "currentColor"} />
      <path d="M3 10l3 3 3-3" className={cn("transition-opacity duration-300", state && "opacity-30")} />
    </svg>
  );
}

export function Table<T extends { id: string | number }>({
  columns,
  rows,
  selectable = true,
  selected: selectedProp,
  defaultSelected = [],
  onSelectionChange,
  defaultSort = null,
  onSortChange,
  stickyHeader = true,
  maxHeight,
  caption,
  empty = "No results.",
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [inner, setInner] = useState(defaultSelected);
  const selected = selectedProp ?? inner;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue ?? ((r: T) => r[sort.key as keyof T] as unknown as string | number);
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      return dir * (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true }));
    });
  }, [rows, columns, sort]);

  // Cycle: ascending -> descending -> unsorted.
  const toggleSort = (key: string) => {
    const next: SortState = sort?.key !== key ? { key, direction: "asc" } : sort.direction === "asc" ? { key, direction: "desc" } : null;
    setSort(next);
    onSortChange?.(next);
  };

  const setSelected = (ids: (string | number)[]) => {
    if (selectedProp === undefined) setInner(ids);
    onSelectionChange?.(ids);
  };
  const allOn = rows.length > 0 && rows.every((r) => selectedSet.has(r.id));
  const someOn = !allOn && rows.some((r) => selectedSet.has(r.id));

  const alignCls = (a?: "left" | "center" | "right") => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("relative w-full overflow-auto rounded-xl border border-border bg-card text-card-foreground shadow-sm", className)}
        style={{ maxHeight }}
      >
        <style href="ui-table" precedence="default">
          {css}
        </style>
        <table className="w-full caption-bottom border-separate border-spacing-0 text-sm">
          {caption && <caption className="border-t border-border px-4 py-3 text-left text-xs text-muted-foreground">{caption}</caption>}
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr>
              {selectable && (
                <th scope="col" className="w-10 border-b border-border bg-card/85 py-3 pl-4 backdrop-blur">
                  <Check
                    checked={allOn}
                    indeterminate={someOn}
                    label="Select all rows"
                    onChange={() => setSelected(allOn ? [] : rows.map((r) => r.id))}
                  />
                </th>
              )}
              {columns.map((c) => {
                const state = sort?.key === c.key ? sort.direction : undefined;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={state ? (state === "asc" ? "ascending" : "descending") : c.sortable ? "none" : undefined}
                    className={cn(
                      "h-11 border-b border-border bg-card/85 px-4 text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase backdrop-blur",
                      alignCls(c.align),
                      c.className,
                    )}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          "group/th -mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 uppercase outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
                          c.align === "right" && "flex-row-reverse",
                          state && "text-foreground",
                        )}
                      >
                        {c.header}
                        <SortIcon state={state} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const on = selectedSet.has(r.id);
              return (
                <motion.tr
                  key={r.id}
                  layout="position"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  data-state={on ? "selected" : undefined}
                  className={cn(
                    "group/row transition-colors duration-200 [&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0",
                    on ? "bg-primary/[0.07]" : "hover:bg-muted/50",
                  )}
                >
                  {selectable && (
                    <td className="relative py-3 pl-4">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-0 left-0 w-0.5 origin-center bg-primary transition-[scale] duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none",
                          on ? "scale-y-100" : "scale-y-0",
                        )}
                      />
                      <Check
                        checked={on}
                        label={`Select row ${r.id}`}
                        onChange={() => setSelected(on ? selected.filter((x) => x !== r.id) : [...selected, r.id])}
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 whitespace-nowrap", alignCls(c.align), c.className)}>
                      {c.cell ? c.cell(r) : String(r[c.key] ?? "")}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MotionConfig>
  );
}
