"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  id: string;
  label: string;
  done?: boolean;
  /** Small tag on the right, e.g. "Today". */
  tag?: string;
}

export interface ChecklistCellProps {
  title?: string;
  /** Initial items (uncontrolled). */
  defaultItems?: ChecklistItem[];
  /** Fired with the full list after every change. */
  onChange?: (items: ChecklistItem[]) => void;
  /** Show the "Add a task" field. */
  allowAdd?: boolean;
  /** Move completed items to the bottom (after the strike-through plays). */
  sinkCompleted?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "notes", label: "Write release notes", tag: "Today" },
  { id: "qa", label: "QA pass on staging", done: true },
  { id: "pricing", label: "Update the pricing page" },
  { id: "video", label: "Record the demo video", tag: "Fri" },
  { id: "beta", label: "Email beta users", done: true },
  { id: "tweet", label: "Schedule the launch thread" },
];

const R = 22;
const CIRC = 2 * Math.PI * R;

/** Open items keep their original order; done items sink below them. */
const sortIds = (list: ChecklistItem[]) =>
  [...list.filter((i) => !i.done), ...list.filter((i) => i.done)].map(
    (i) => i.id,
  );

export function ChecklistCell({
  title = "Launch checklist",
  defaultItems = DEFAULT_ITEMS,
  onChange,
  allowAdd = true,
  sinkCompleted = true,
  className,
}: ChecklistCellProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [items, setItems] = useState(defaultItems);
  const [order, setOrder] = useState(() =>
    sinkCompleted ? sortIds(defaultItems) : defaultItems.map((i) => i.id),
  );
  const [draft, setDraft] = useState("");
  const [pulse, setPulse] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (next: ChecklistItem[], delay: number) => {
    setItems(next);
    onChange?.(next);
    clearTimeout(timer.current);
    const apply = () =>
      setOrder(sinkCompleted ? sortIds(next) : next.map((i) => i.id));
    if (delay && !reduce) timer.current = setTimeout(apply, delay);
    else apply();
  };

  const toggle = (itemId: string) => {
    setPulse(itemId);
    commit(
      items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
      550,
    );
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    const label = draft.trim();
    if (!label) return;
    setDraft("");
    commit([{ id: `add-${items.length}`, label }, ...items], 0); // items only grow, so the length is a unique id
  };

  const byId = new Map(items.map((i) => [i.id, i]));
  const rows = !sinkCompleted
    ? items
    : order.map((k) => byId.get(k)).filter((i): i is ChecklistItem => !!i);
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? done / items.length : 0;
  const complete = items.length > 0 && done === items.length;

  return (
    <div
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl shadow-black/20",
        className,
      )}
    >
      <div className="flex items-center gap-4 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <h3
            id={`${id}-t`}
            className="truncate text-lg font-semibold tracking-tight"
          >
            {title}
          </h3>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={complete ? "all" : done}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-sm text-muted-foreground"
            >
              {complete ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="size-3.5 text-primary" aria-hidden /> All
                  done. Ship it!
                </span>
              ) : (
                `${done} of ${items.length} completed`
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* progress ring */}
        <div
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct * 100)}
          className="relative grid size-14 shrink-0 place-items-center"
        >
          <svg
            viewBox="0 0 52 52"
            className="absolute inset-0 -rotate-90"
            aria-hidden
          >
            <circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              strokeWidth="4.5"
              className="stroke-muted"
            />
            <motion.circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              className="stroke-primary"
              initial={false}
              animate={{ strokeDashoffset: CIRC * (1 - pct) }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </svg>
          <AnimatePresence mode="popLayout" initial={false}>
            {complete ? (
              <motion.span
                key="check"
                initial={reduce ? false : { scale: 0, rotate: -60 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
              >
                <Check className="size-5" strokeWidth={3} aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="pct"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="text-xs font-semibold tabular-nums"
              >
                {Math.round(pct * 100)}%
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {allowAdd && (
        <form
          onSubmit={add}
          className="mx-5 mb-2 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 transition-colors focus-within:border-ring focus-within:border-solid"
        >
          <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <label htmlFor={`${id}-add`} className="sr-only">
            Add a task
          </label>
          <input
            id={`${id}-add`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a task and press Enter"
            maxLength={80}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      )}

      <ul aria-labelledby={`${id}-t`} className="grid gap-0.5 px-2.5 pb-3">
        <AnimatePresence initial={false}>
          {rows.map((item) => {
            const inputId = `${id}-${item.id}`;
            return (
              <motion.li
                key={item.id}
                layout={reduce ? false : "position"}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 34 },
                  duration: 0.2,
                }}
              >
                <label
                  htmlFor={inputId}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors select-none hover:bg-muted/70 has-focus-visible:bg-muted/70 has-focus-visible:ring-2 has-focus-visible:ring-ring/50"
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={!!item.done}
                    onChange={() => toggle(item.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "relative grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] transition-[background-color,border-color,scale] duration-200 group-active:scale-90",
                      item.done
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/50 group-hover:border-foreground/70",
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        initial={false}
                        animate={{ pathLength: item.done ? 1 : 0 }}
                        transition={{
                          duration: reduce ? 0 : 0.25,
                          delay: item.done ? 0.05 : 0,
                        }}
                      />
                    </svg>
                    {/* ring pulse on completion */}
                    {item.done && pulse === item.id && !reduce && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="relative inline-block max-w-full align-middle">
                      <span
                        className={cn(
                          "block truncate text-sm transition-colors duration-300",
                          item.done
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      <motion.span
                        aria-hidden
                        className="absolute top-1/2 left-0 h-[1.5px] w-full origin-left rounded-full bg-muted-foreground"
                        initial={false}
                        animate={{ scaleX: item.done ? 1 : 0 }}
                        transition={{
                          duration: reduce ? 0 : 0.35,
                          ease: [0.65, 0, 0.35, 1],
                        }}
                      />
                    </span>
                  </span>
                  {item.tag && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium transition-opacity",
                        item.done
                          ? "bg-muted text-muted-foreground opacity-60"
                          : "bg-primary/15 text-foreground",
                      )}
                    >
                      {item.tag}
                    </span>
                  )}
                </label>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
