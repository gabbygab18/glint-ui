"use client";

// Adapted from Calamansi UI by fujiDevv (MIT License).
// https://github.com/fujiDevv/calamansi-ui

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type Transition,
} from "motion/react";
import { getSvgPath } from "figma-squircle";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

/* ─── Liquid bar primitives (inlined from Calamansi's lib/liquid) ────────────
   Surfaces are painted on layers inset by springs, so seams open without the
   layout moving. The stage is blurred, pushed through a steep alpha ramp so any
   bleed between neighbours becomes solid matter (a metaball thread), and the
   crisp stage is drawn back on top so labels stay sharp. */

const LIQUID_SPRING = { type: "spring", stiffness: 200, damping: 28, mass: 1 } as const;
/** Where a blurred thread gives up, as a multiple of the blur radius. */
const LIQUID_SEVER = 1.234;
/** Default blur as a share of the gap. */
const LIQUID_VISCOSITY = 0.55;
/** Sealed extension, in corner radii: enough to hide a neighbour's corner. */
const LIQUID_SEAL = 2;
const BEAD_SIZE = 0.18;
const BEAD_FADE = 0.22;
const BEAD_PEAK_MAX = 0.92;
const SWALLOW_REACH = 0.25;

function beadPercent(gap: number, sever: number, open: number) {
  if (!Number.isFinite(gap) || open <= 0) return 0;
  const travel = gap / open;
  if (travel <= 0) return 0;
  const peak = Math.min(sever / open, BEAD_PEAK_MAX);
  if (travel < peak) return BEAD_SIZE * 100 * (travel / peak) ** 1.6;
  const fade = Math.min(BEAD_FADE, 1 - peak);
  const past = (travel - peak) / fade;
  return past >= 1 ? 0 : BEAD_SIZE * 100 * (1 - past);
}

function swallowShare(retracted: number, pull: number) {
  if (pull <= 0) return 1;
  const reach = SWALLOW_REACH * pull;
  const s = Math.min(1, Math.max(0, (reach - retracted) / reach));
  return s * s * (3 - 2 * s);
}

function FuseFilter({ id, blur, threshold }: { id: string; blur: number; threshold: number }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <defs>
        <filter id={id} x="-8%" y="-60%" width="116%" height="220%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold} ${-threshold / 2}`}
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function Squircle({ className, radius }: { className?: string; radius: number }) {
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const path = useMemo(
    () =>
      bounds.width > 0 && bounds.height > 0
        ? getSvgPath({ width: bounds.width, height: bounds.height, cornerRadius: radius, cornerSmoothing: 1 })
        : null,
    [bounds.width, bounds.height, radius],
  );
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
      <span
        ref={ref}
        style={path ? { clipPath: `path('${path}')` } : { borderRadius: radius }}
        className={cn("relative block size-full overflow-hidden", className)}
      />
    </span>
  );
}

type LiquidSegmentProps = {
  seamLeft: boolean;
  seamRight: boolean;
  atStart: boolean;
  atEnd: boolean;
  radius: number;
  pull: number;
  seal: number;
  sever: number;
  bead: boolean;
  beadFill: string;
  paint: string;
  reduced: boolean;
  children: ReactNode;
};

function LiquidSegment({
  seamLeft,
  seamRight,
  atStart,
  atEnd,
  radius,
  pull,
  seal,
  sever,
  bead,
  beadFill,
  paint,
  reduced,
  children,
}: LiquidSegmentProps) {
  const retractLeft = useSpring(!atStart && seamLeft ? pull : 0, LIQUID_SPRING);
  const retractRight = useSpring(!atEnd && seamRight ? pull : 0, LIQUID_SPRING);

  useEffect(() => {
    const left = !atStart && seamLeft ? pull : 0;
    const right = !atEnd && seamRight ? pull : 0;
    if (reduced) {
      retractLeft.jump(left);
      retractRight.jump(right);
    } else {
      retractLeft.set(left);
      retractRight.set(right);
    }
  }, [atStart, atEnd, seamLeft, seamRight, pull, reduced, retractLeft, retractRight]);

  // the swallow under the neighbour waits for the retraction to come home, then eases in
  const left = useTransform(() => {
    const r = retractLeft.get();
    return r - (atStart ? 0 : seal * swallowShare(r, pull));
  });
  const right = useTransform(() => {
    const r = retractRight.get();
    return r - (atEnd ? 0 : seal * swallowShare(r, pull));
  });
  // content rides with the visible edge only
  const shift = useTransform(() => (Math.max(0, left.get()) - Math.max(0, right.get())) / 2);
  const beadHeight = useTransform(() => `${beadPercent(left.get() * 2, sever, pull * 2)}%`);

  return (
    <li className="relative flex">
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-y-0 block" style={{ left, right }}>
        <Squircle radius={radius} className={cn("transition-colors duration-300 ease-out", paint)} />
      </motion.span>
      {bead && !atStart && (
        <motion.span
          aria-hidden="true"
          className={cn("pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current", beadFill)}
          style={{ left: 0, height: beadHeight, aspectRatio: 1 }}
        />
      )}
      <motion.div className="relative z-10 flex min-w-0" style={{ x: shift }}>
        {children}
      </motion.div>
    </li>
  );
}

/* ─── Duration picker ────────────────────────────────────────────────────── */

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const WIDTH_SPRING = { stiffness: 250, damping: 31 } as const;
const ERROR_SPRING = { stiffness: 700, damping: 9 } as const;
const SWAY_SPRING = { stiffness: 200, damping: 24 } as const;
const ICON_SPRING = { stiffness: 300, damping: 30 } as const;

/** How far a field is nudged when it is handed a value out of range. */
const REFUSAL = 6;

const PEN_PATH =
  "M3.78181 16.3092L3 21L7.69086 20.2182C8.50544 20.0825 9.25725 19.6956 9.84119 19.1116L20.4198 8.53288C21.1934 7.75922 21.1934 6.5049 20.4197 5.73126L18.2687 3.58024C17.495 2.80658 16.2406 2.80659 15.4669 3.58027L4.88841 14.159C4.30447 14.7429 3.91757 15.4947 3.78181 16.3092Z";
const TICK_PATH = "M4.6 12.4 9.6 17.4 19.4 7.6";

export type DurationValue = { hours: number; minutes: number };
export type DurationPickerVariant = "white" | "calamansi" | "slate" | "citrus";
export type DurationPickerSize = "sm" | "md" | "lg";

const VARIANTS: Record<DurationPickerVariant, { paint: string; juice: string; ink: string }> = {
  white: { paint: "bg-white dark:bg-[#1c1c1f]", juice: "text-white dark:text-[#1c1c1f]", ink: "text-foreground" },
  calamansi: { paint: "bg-[#5c7a67] dark:bg-[#16221a]", juice: "text-[#5c7a67] dark:text-[#16221a]", ink: "text-white" },
  slate: { paint: "bg-[#687396] dark:bg-[#1e293b]", juice: "text-[#687396] dark:text-[#1e293b]", ink: "text-white" },
  citrus: { paint: "bg-[#b87152] dark:bg-[#22120b]", juice: "text-[#b87152] dark:text-[#22120b]", ink: "text-white" },
};

/** The tray. Must be opaque: the fuse's alpha ramp erases translucent paint. */
const TRAY = "bg-muted";
const TRAY_INK = "text-muted";

const SIZES = {
  sm: { bar: "h-10", radius: 16, gap: 10, field: "px-3.5", toggle: "size-10", icon: "size-4", text: "text-sm", unit: "text-[11px]", box: 40 },
  md: { bar: "h-12", radius: 20, gap: 12, field: "px-4", toggle: "size-12", icon: "size-[18px]", text: "text-base", unit: "text-xs", box: 44 },
  lg: { bar: "h-14", radius: 24, gap: 14, field: "px-5", toggle: "size-14", icon: "size-5", text: "text-lg", unit: "text-sm", box: 48 },
} as const;

export type DurationPickerProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Controlled value. */
  value?: DurationValue;
  /** Value on mount when uncontrolled. */
  defaultValue?: DurationValue;
  /** Fired on every keystroke with the clamped value. */
  onChange?: (value: DurationValue) => void;
  /** Fired when the bar is committed (the tick, or Enter in a field). */
  onConfirm?: (value: DurationValue) => void;
  /** Fired when the pieces split apart or merge back. */
  onEditingChange?: (editing: boolean) => void;
  /** Hold the bar open or shut yourself. */
  editing?: boolean;
  /** Open the bar on mount when uncontrolled. */
  defaultEditing?: boolean;
  /** Ceiling for the hours field. */
  maxHours?: number;
  /** Ceiling for the minutes field. */
  maxMinutes?: number;
  /** Unit after the hours field. */
  hoursLabel?: string;
  /** Unit after the minutes field. */
  minutesLabel?: string;
  /** Palette the save button and the bead wear. */
  variant?: DurationPickerVariant;
  /** Bar height, and with it the corner, travel and field widths. */
  size?: DurationPickerSize;
  /** Override how far the seams open on each side, in px. */
  gap?: number;
  /** Override the corner radius, in px. */
  radius?: number;
  /** SVG blur behind the fuse, in px. Defaults to 0.55 of the gap. */
  viscosity?: number;
  /** Alpha ramp slope: how hard the fused edge is. */
  threshold?: number;
  /** Run the fuse at all. Off, the pieces simply slide apart. */
  gooey?: boolean;
  /** Leave a bead of juice behind when the thread severs. */
  bead?: boolean;
  disabled?: boolean;
};

function fieldText(value: DurationValue | undefined, field: keyof DurationValue) {
  const n = value?.[field];
  return n === undefined || n === 0 ? "" : String(n);
}

const clampField = (raw: number, max: number) => Math.min(max, Math.max(0, Math.trunc(raw) || 0));

const DEFAULT_HOURS = "Hr.";
const DEFAULT_MINUTES = "Min.";

type DurationFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  max: number;
  label: string;
  editing: boolean;
  reduced: boolean;
  disabled?: boolean;
  sway: MotionValue<number>;
  size: DurationPickerSize;
  inputRef?: RefObject<HTMLInputElement | null>;
};

/** One number field: collapsed to its digits at rest, springs to a fixed width when live. */
function DurationField({ value, onValueChange, onCommit, max, label, editing, reduced, disabled, sway, size, inputRef }: DurationFieldProps) {
  const preset = SIZES[size];
  const measureRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const refusal = useSpring(0, ERROR_SPRING);
  const x = useTransform(() => sway.get() + refusal.get());

  useIsoLayoutEffect(() => {
    if (measureRef.current) setTextWidth(measureRef.current.offsetWidth);
  }, [value, preset.text]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    // out of range: take the nearest legal value and shake the field
    if (next !== "" && (Number(next) > max || Number(next) < 0)) {
      onValueChange(String(clampField(Number(next), max)));
      if (!reduced) {
        refusal.jump(REFUSAL);
        refusal.set(0);
      }
      return;
    }
    onValueChange(next);
  };

  const collapsed = Math.max(textWidth + 12, 22);

  return (
    <>
      <motion.input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
        placeholder={editing ? "" : "0"}
        readOnly={!editing}
        disabled={disabled}
        aria-label={label}
        min={0}
        max={max}
        style={{ x }}
        animate={{ width: editing ? preset.box : collapsed }}
        transition={reduced ? { duration: 0 } : { type: "spring", ...WIDTH_SPRING }}
        className={cn(
          "h-full shrink-0 bg-transparent text-center font-semibold tabular-nums text-foreground outline-none",
          "selection:bg-primary/30",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          preset.text,
        )}
      />
      {/* same font as the input, so the collapsed width is the digits' width */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className={cn("pointer-events-none invisible absolute whitespace-pre font-semibold tabular-nums", preset.text)}
      >
        {value || "0"}
      </span>
    </>
  );
}

/**
 * Hours, minutes and a save button fused into one bar. Press the pen and the pieces
 * pull apart on a metaball thread; commit and they merge back.
 */
export function DurationPicker({
  value,
  defaultValue,
  onChange,
  onConfirm,
  onEditingChange,
  editing: editingProp,
  defaultEditing = false,
  maxHours = 24,
  maxMinutes = 60,
  hoursLabel = DEFAULT_HOURS,
  minutesLabel = DEFAULT_MINUTES,
  variant = "calamansi",
  size = "md",
  gap: gapProp,
  radius: radiusProp,
  viscosity,
  threshold = 19,
  gooey = true,
  bead = true,
  disabled = false,
  className,
  ...props
}: DurationPickerProps) {
  const reduced = useReducedMotion() ?? false;
  const filterId = `duration-picker-${useId().replace(/:/g, "")}`;
  const preset = SIZES[size] ?? SIZES.md;
  const palette = VARIANTS[variant] ?? VARIANTS.calamansi;

  const gap = gapProp ?? preset.gap;
  const corner = radiusProp ?? preset.radius;
  const blur = viscosity ?? gap * LIQUID_VISCOSITY;
  const sever = LIQUID_SEVER * blur;
  const seal = LIQUID_SEAL * corner;
  const pull = gap / 2;
  const fused = gooey && !reduced;

  const [uncontrolledEditing, setUncontrolledEditing] = useState(defaultEditing);
  const editing = editingProp ?? uncontrolledEditing;
  const [hours, setHours] = useState(() => fieldText(value ?? defaultValue, "hours"));
  const [minutes, setMinutes] = useState(() => fieldText(value ?? defaultValue, "minutes"));
  const hoursRef = useRef<HTMLInputElement>(null);

  // adopt a changed outside value in render, without fighting the caret
  const [seen, setSeen] = useState(() => [value?.hours, value?.minutes] as const);
  if (value && (value.hours !== seen[0] || value.minutes !== seen[1])) {
    setSeen([value.hours, value.minutes]);
    if (clampField(Number(hours), maxHours) !== clampField(value.hours, maxHours)) setHours(fieldText(value, "hours"));
    if (clampField(Number(minutes), maxMinutes) !== clampField(value.minutes, maxMinutes)) setMinutes(fieldText(value, "minutes"));
  }

  // the fields lean into the split and settle out of it, driven by the seam spring's velocity
  const open = useSpring(defaultEditing ? 1 : 0, LIQUID_SPRING);
  useEffect(() => {
    const to = editing ? 1 : 0;
    if (reduced) open.jump(to);
    else open.set(to);
  }, [editing, reduced, open]);

  const velocity = useVelocity(open);
  const swayRaw = useTransform(velocity, [-3, 0, 3], [-3, 0, 3], { clamp: true });
  const sway = useSpring(swayRaw, SWAY_SPRING);

  const toValue = (h: string, m: string): DurationValue => ({
    hours: clampField(Number(h), maxHours),
    minutes: clampField(Number(m), maxMinutes),
  });

  const applyEditing = (next: boolean) => {
    if (editingProp === undefined) setUncontrolledEditing(next);
    onEditingChange?.(next);
  };

  const commit = () => {
    applyEditing(false);
    onConfirm?.(toValue(hours, minutes));
  };

  const toggleEditing = () => {
    if (disabled) return;
    if (editing) return commit();
    applyEditing(true);
    hoursRef.current?.focus();
  };

  const handleHours = (text: string) => {
    setHours(text);
    onChange?.(toValue(text, minutes));
  };
  const handleMinutes = (text: string) => {
    setMinutes(text);
    onChange?.(toValue(hours, text));
  };

  const transition: Transition = reduced ? { duration: 0 } : ICON_SPRING;
  const segment = { radius: corner, pull, seal, sever, bead, reduced };

  return (
    <div
      data-editing={editing || undefined}
      data-variant={variant}
      className={cn("relative inline-flex", disabled && "opacity-50", className)}
      {...props}
    >
      <FuseFilter id={filterId} blur={blur} threshold={threshold} />
      <ul className={cn("relative flex items-stretch", preset.bar)} style={fused ? { filter: `url(#${filterId})` } : undefined}>
        <LiquidSegment {...segment} seamLeft={false} seamRight={editing} atStart atEnd={false} beadFill={palette.juice} paint={TRAY}>
          <div className={cn("flex h-full items-center gap-1", preset.field)}>
            <DurationField
              value={hours}
              onValueChange={handleHours}
              onCommit={commit}
              max={maxHours}
              label={hoursLabel === DEFAULT_HOURS ? "Hours" : hoursLabel}
              editing={editing}
              reduced={reduced}
              disabled={disabled}
              sway={sway}
              size={size}
              inputRef={hoursRef}
            />
            <motion.span style={{ x: sway }} className={cn("shrink-0 text-muted-foreground", preset.unit)}>
              {hoursLabel}
            </motion.span>
          </div>
        </LiquidSegment>

        <LiquidSegment {...segment} seamLeft={editing} seamRight={editing} atStart={false} atEnd={false} beadFill={TRAY_INK} paint={TRAY}>
          <div className={cn("flex h-full items-center gap-1", preset.field)}>
            <DurationField
              value={minutes}
              onValueChange={handleMinutes}
              onCommit={commit}
              max={maxMinutes}
              label={minutesLabel === DEFAULT_MINUTES ? "Minutes" : minutesLabel}
              editing={editing}
              reduced={reduced}
              disabled={disabled}
              sway={sway}
              size={size}
            />
            <motion.span style={{ x: sway }} className={cn("shrink-0 text-muted-foreground", preset.unit)}>
              {minutesLabel}
            </motion.span>
          </div>
        </LiquidSegment>

        <LiquidSegment
          {...segment}
          seamLeft={editing}
          seamRight={false}
          atStart={false}
          atEnd
          beadFill={palette.juice}
          paint={cn(TRAY, editing && palette.paint)}
        >
          <button
            type="button"
            onClick={toggleEditing}
            disabled={disabled}
            aria-label={editing ? "Save duration" : "Edit duration"}
            aria-pressed={editing}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-full outline-none transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-90 disabled:cursor-not-allowed disabled:active:scale-100",
              preset.toggle,
              editing ? palette.ink : "text-muted-foreground hover:text-foreground",
            )}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("overflow-visible", preset.icon)}>
              {/* the pen puts itself away as the tick draws itself on */}
              <motion.path
                d={PEN_PATH}
                fill="currentColor"
                initial={false}
                animate={{ opacity: editing ? 0 : 1, y: editing ? -3 : 0 }}
                transition={transition}
              />
              <motion.path
                d={TICK_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: editing ? 1 : 0, opacity: editing ? 1 : 0 }}
                transition={transition}
              />
            </svg>
          </button>
        </LiquidSegment>
      </ul>
    </div>
  );
}
