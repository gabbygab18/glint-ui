"use client";

import { GripVertical } from "lucide-react";
import { MotionConfig, Reorder, useDragControls } from "motion/react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ReorderItem {
  id: string;
  label: ReactNode;
  /** Optional second line. */
  description?: ReactNode;
  /** Optional element before the label, e.g. an icon. */
  leading?: ReactNode;
}

export interface ReorderListProps {
  /** Controlled order. */
  items?: ReorderItem[];
  defaultItems?: ReorderItem[];
  onChange?: (items: ReorderItem[]) => void;
  /** Accessible name of the list. */
  label?: string;
  className?: string;
}

function Row({
  item,
  index,
  count,
  move,
}: {
  item: ReorderItem;
  index: number;
  count: number;
  move: (from: number, to: number) => void;
}) {
  const controls = useDragControls();

  const onKey = (e: KeyboardEvent) => {
    const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : -1;
    if (to < 0 || to >= count) return;
    e.preventDefault();
    move(index, to);
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="relative flex select-none items-center gap-2.5 rounded-xl border border-border bg-card py-2.5 pl-2 pr-3.5"
      whileDrag={{ scale: 1.03, boxShadow: "0 18px 40px -12px rgb(0 0 0 / 0.45)", zIndex: 10 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
    >
      <button
        type="button"
        aria-label={`Move ${typeof item.label === "string" ? item.label : "item"}, position ${index + 1} of ${count}. Use arrow keys.`}
        onPointerDown={(e) => controls.start(e)}
        onKeyDown={onKey}
        className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      {item.leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{item.label}</div>
        {item.description && <div className="truncate text-xs text-muted-foreground">{item.description}</div>}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{index + 1}</span>
    </Reorder.Item>
  );
}

/**
 * A list you can drag into a new order by its handles. The picked-up row lifts
 * with a shadow while the others spring out of its way, and the handles also
 * move rows with the arrow keys, announced to screen readers.
 */
export function ReorderList({ items, defaultItems = [], onChange, label = "Reorderable list", className }: ReorderListProps) {
  const [inner, setInner] = useState(defaultItems);
  const [announce, setAnnounce] = useState("");
  const group = useRef<HTMLUListElement>(null);
  const list = items ?? inner;

  const set = (next: ReorderItem[]) => {
    if (items === undefined) setInner(next);
    onChange?.(next);
  };

  const move = (from: number, to: number) => {
    const next = [...list];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    set(next);
    setAnnounce(`Moved to position ${to + 1} of ${next.length}`);
    // Keep focus on the moved row's handle after it re-renders.
    requestAnimationFrame(() => group.current?.querySelectorAll<HTMLElement>(":scope > li > button")[to]?.focus());
  };

  return (
    <MotionConfig reducedMotion="user">
      <Reorder.Group axis="y" values={list} onReorder={set} ref={group} aria-label={label} className={cn("grid grid-cols-[minmax(0,1fr)] gap-2", className)}>
        {list.map((item, i) => (
          <Row key={item.id} item={item} index={i} count={list.length} move={move} />
        ))}
      </Reorder.Group>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </MotionConfig>
  );
}
