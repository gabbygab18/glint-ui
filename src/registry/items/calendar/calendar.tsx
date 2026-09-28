"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useIsPresent } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to?: Date;
}

interface BaseProps {
  /** Month shown first. Defaults to the selection, else the current month. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** BCP 47 locale for month and weekday names. Fixed default keeps SSR and client in sync. */
  locale?: string;
  /** Earliest selectable day. */
  min?: Date;
  /** Latest selectable day. */
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
}

export interface CalendarSingleProps extends BaseProps {
  mode?: "single";
  selected?: Date | null;
  defaultSelected?: Date | null;
  onSelect?: (date: Date) => void;
}

export interface CalendarRangeProps extends BaseProps {
  mode: "range";
  selected?: DateRange | null;
  defaultSelected?: DateRange | null;
  onSelect?: (range: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

// Tiny date helpers: local-time calendar days, no library.
const mk = (y: number, m: number, d: number) => new Date(y, m, d);
const addDays = (d: Date, n: number) => mk(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthStart = (d: Date) => mk(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) =>
  mk(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), mk(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()));
const num = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const same = (a?: Date | null, b?: Date | null) => !!a && !!b && num(a) === num(b);
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toRange = (v?: Date | DateRange | null): DateRange | null => (v instanceof Date ? { from: v, to: v } : (v ?? null));

// "Today" only exists on the client; the server snapshot is empty so hydration never mismatches.
const noSubscribe = () => () => {};
function useToday() {
  const key = useSyncExternalStore(noSubscribe, () => ymd(new Date()), () => "");
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return mk(y, m - 1, d);
}

const slide = {
  enter: (dir: number) => ({ x: `${dir * 45}%`, opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -45}%`, opacity: 0 }),
};

function MonthBody({ monthKey, dir, children }: { monthKey: string; dir: number; children: ReactNode }) {
  const present = useIsPresent(); // the outgoing month stays visible while sliding, but not interactive
  return (
    <motion.div
      role="rowgroup"
      data-month={monthKey}
      inert={!present}
      custom={dir}
      variants={slide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ x: { type: "spring", stiffness: 420, damping: 40 }, opacity: { duration: 0.2 } }}
      className="grid w-full gap-y-1"
    >
      {children}
    </motion.div>
  );
}

export function Calendar(props: CalendarProps) {
  const { defaultMonth, onMonthChange, weekStartsOn = 0, locale = "en-US", min, max, isDateDisabled, className } = props;
  const range = props.mode === "range";
  const [innerSel, setInnerSel] = useState(() => toRange(props.defaultSelected));
  const sel = props.selected !== undefined ? toRange(props.selected) : innerSel;
  const today = useToday();
  const [monthState, setMonthState] = useState(() => {
    const anchor = defaultMonth ?? sel?.from;
    return anchor ? monthStart(anchor) : null;
  });
  const month = monthState ?? (today && monthStart(today));
  const [dir, setDir] = useState(1);
  const [focused, setFocused] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const focusPending = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, o);
  const monthFmt = fmt({ month: "long", year: "numeric" });
  const dayFmt = fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const weekdayShort = fmt({ weekday: "short" });
  const weekdayLong = fmt({ weekday: "long" });
  const weekdays = Array.from({ length: 7 }, (_, i) => mk(2024, 0, 7 + ((i + weekStartsOn) % 7))); // 2024-01-07 is a Sunday

  const inMonth = (d: Date) => !!month && d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  const disabled = (d: Date) => (!!min && num(d) < num(min)) || (!!max && num(d) > num(max)) || !!isDateDisabled?.(d);

  const goto = (target: Date) => {
    const m = monthStart(target);
    if (month && same(m, month)) return;
    setDir(month && num(m) < num(month) ? -1 : 1);
    setMonthState(m);
    onMonthChange?.(m);
  };

  const select = (d: Date) => {
    if (disabled(d)) return;
    setFocused(d);
    goto(d);
    let next: DateRange;
    if (!range) next = { from: d, to: d };
    else if (!sel || sel.to) next = { from: d };
    else next = num(d) < num(sel.from) ? { from: d, to: sel.from } : { from: sel.from, to: d };
    if (props.selected === undefined) setInnerSel(next);
    if (props.mode === "range") props.onSelect?.(next);
    else props.onSelect?.(d);
  };

  // WAI-ARIA date grid keys: arrows by day/week, Home/End within the week, PageUp/Down by month (Shift: year).
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, d: Date) => {
    const col = (d.getDay() - weekStartsOn + 7) % 7;
    const moves: Record<string, Date> = {
      ArrowLeft: addDays(d, -1),
      ArrowRight: addDays(d, 1),
      ArrowUp: addDays(d, -7),
      ArrowDown: addDays(d, 7),
      Home: addDays(d, -col),
      End: addDays(d, 6 - col),
      PageUp: addMonths(d, e.shiftKey ? -12 : -1),
      PageDown: addMonths(d, e.shiftKey ? 12 : 1),
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    focusPending.current = true;
    setFocused(next);
    goto(next);
  };

  useEffect(() => {
    if (!focusPending.current || !focused || !month) return;
    focusPending.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-month="${ymd(month)}"] [data-date="${ymd(focused)}"]`)
      ?.focus({ preventScroll: true });
  }, [focused, month]);

  const tabDate = [focused, sel?.from, today].find((d) => d && inMonth(d)) ?? month;

  // While picking a range end, preview it under the pointer (or keyboard focus).
  const picking = range && !!sel && !sel.to;
  const preview = picking ? (hover ?? focused) : null;
  let lo = sel?.from;
  let hi = sel?.to;
  if (picking && sel && preview) [lo, hi] = num(preview) < num(sel.from) ? [preview, sel.from] : [sel.from, preview];

  const days = month
    ? Array.from({ length: 42 }, (_, i) => addDays(month, i - ((month.getDay() - weekStartsOn + 7) % 7)))
    : [];

  const renderDay = (d: Date, col: number) => {
    const outside = !inMonth(d);
    const off = disabled(d);
    const isStart = same(d, lo);
    const isEnd = same(d, hi);
    const between = !!lo && !!hi && num(d) > num(lo) && num(d) < num(hi);
    const selected = range ? isStart || isEnd : same(d, sel?.from);
    const tentative = picking && !same(d, sel?.from);
    const band = range && lo && hi && !same(lo, hi) && (between || isStart || isEnd);

    return (
      <div key={ymd(d)} role="gridcell" aria-selected={selected || between || undefined} className="relative grid h-10 place-items-center">
        {band && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0.5 bg-primary/15",
              between && "inset-x-0",
              isStart && "left-1/2 right-0",
              isEnd && "left-0 right-1/2",
              col === 0 && "rounded-l-lg",
              col === 6 && "rounded-r-lg",
              tentative && "bg-primary/10",
            )}
          />
        )}
        <button
          type="button"
          data-date={ymd(d)}
          tabIndex={tabDate && same(d, tabDate) && !outside ? 0 : -1}
          aria-label={dayFmt.format(d)}
          aria-current={same(d, today) ? "date" : undefined}
          aria-disabled={off || undefined}
          onClick={() => select(d)}
          onKeyDown={(e) => onKey(e, d)}
          onMouseEnter={range ? () => setHover(d) : undefined}
          className={cn(
            "relative isolate grid size-10 place-items-center rounded-lg text-sm tabular-nums outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-1 focus-visible:ring-offset-card",
            outside ? "text-muted-foreground/45" : "text-foreground",
            !selected && !off && "hover:bg-muted",
            selected && "font-semibold text-primary-foreground",
            off && "cursor-not-allowed text-muted-foreground/35 line-through",
          )}
        >
          {selected && (
            <motion.span
              aria-hidden
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className={cn("absolute inset-0 -z-10 rounded-lg bg-primary", tentative && "bg-primary/70", outside && "opacity-60")}
            />
          )}
          {d.getDate()}
          {same(d, today) && (
            <span
              aria-hidden
              className={cn(
                "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                selected ? "bg-primary-foreground" : "bg-primary",
              )}
            />
          )}
        </button>
      </div>
    );
  };

  const navBtn =
    "grid size-8 place-items-center rounded-lg border border-border text-muted-foreground outline-none transition-[background-color,color,scale] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-90 disabled:pointer-events-none disabled:opacity-40";

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("inline-block w-fit rounded-xl border border-border bg-card p-3 text-card-foreground", className)}>
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!month || (!!min && num(addDays(month, -1)) < num(min))}
            onClick={() => month && goto(addMonths(month, -1))}
            className={navBtn}
          >
            <ChevronLeft className="size-4" />
          </button>
          <div id={labelId} aria-live="polite" className="overflow-hidden text-sm font-semibold">
            {month && (
              <motion.span
                key={ymd(month)}
                className="block"
                initial={{ opacity: 0, y: dir * 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {monthFmt.format(month)}
              </motion.span>
            )}
          </div>
          <button
            type="button"
            aria-label="Next month"
            disabled={!month || (!!max && num(monthStart(addMonths(month, 1))) > num(max))}
            onClick={() => month && goto(addMonths(month, 1))}
            className={navBtn}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div ref={gridRef} role="grid" aria-labelledby={labelId} onMouseLeave={() => setHover(null)}>
          <div role="row" className="grid grid-cols-7">
            {weekdays.map((w) => (
              <div
                key={w.getDay()}
                role="columnheader"
                aria-label={weekdayLong.format(w)}
                className="grid h-8 w-10 place-items-center text-xs font-medium text-muted-foreground"
              >
                {weekdayShort.format(w)}
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden" style={{ height: 6 * 40 + 5 * 4 }}>
            <AnimatePresence initial={false} mode="popLayout" custom={dir}>
              {month && (
                <MonthBody key={ymd(month)} monthKey={ymd(month)} dir={dir}>
                  {Array.from({ length: 6 }, (_, r) => (
                    <div key={r} role="row" className="grid grid-cols-7">
                      {days.slice(r * 7, r * 7 + 7).map(renderDay)}
                    </div>
                  ))}
                </MonthBody>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
