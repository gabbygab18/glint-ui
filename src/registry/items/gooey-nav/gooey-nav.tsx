"use client";

// Adapted from Calamansi UI by fujiDevv (MIT License).
// https://github.com/fujiDevv/calamansi-ui

import { useEffect, useId, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
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

/* ─── Gooey nav ──────────────────────────────────────────────────────────── */

export type GooeyNavVariant = "white" | "calamansi" | "slate" | "citrus";
export type GooeyNavSize = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<GooeyNavVariant, { paint: string; juice: string; ink: string }> = {
  white: { paint: "bg-white dark:bg-[#1c1c1f]", juice: "text-white dark:text-[#1c1c1f]", ink: "text-foreground" },
  calamansi: { paint: "bg-[#5c7a67] dark:bg-[#16221a]", juice: "text-[#5c7a67] dark:text-[#16221a]", ink: "text-white" },
  slate: { paint: "bg-[#687396] dark:bg-[#1e293b]", juice: "text-[#687396] dark:text-[#1e293b]", ink: "text-white" },
  citrus: { paint: "bg-[#b87152] dark:bg-[#22120b]", juice: "text-[#b87152] dark:text-[#22120b]", ink: "text-white" },
};

/** The tray. Must be opaque: the fuse's alpha ramp erases translucent paint. */
const TRAY = "bg-muted";
const TRAY_INK = "text-muted";

/** Radii hold the brand's ~0.42 share of the bar height; `separation` is the gap the pill opens. */
const SIZES = {
  xs: { label: "gap-1 px-3.5 py-1.5 text-[11px] leading-4 [&_svg]:size-[11px]", radius: 12, separation: 14 },
  sm: { label: "gap-1.5 px-4 py-2 text-xs leading-4 [&_svg]:size-3", radius: 14, separation: 16 },
  md: { label: "gap-2 px-5 py-2.5 text-sm leading-5 [&_svg]:size-3.5", radius: 16, separation: 20 },
  lg: { label: "gap-2.5 px-6 py-3 text-base leading-6 [&_svg]:size-4", radius: 20, separation: 24 },
} as const;

export type GooeyNavItem = string | { label: string; href?: string; icon?: ReactNode };
type NavItem = { label: string; href?: string; icon?: ReactNode };
const toItem = (item: GooeyNavItem): NavItem => (typeof item === "string" ? { label: item } : item);

export type GooeyNavProps = Omit<ComponentProps<"nav">, "onChange"> & {
  /** Labels, or `{ label, href, icon }` objects. */
  items: GooeyNavItem[];
  /** Active index, for controlled use. */
  value?: number;
  /** Active index on mount when uncontrolled. */
  defaultValue?: number;
  /** Fired with the new index on selection. */
  onChange?: (index: number) => void;
  /** Palette the active pill wears. */
  variant?: GooeyNavVariant;
  /** Label size, and with it the radius and travel. */
  size?: GooeyNavSize;
  /** Override the gap the pill opens on each side, in px. */
  separation?: number;
  /** Override the corner radius, in px. */
  radius?: number;
  /** SVG blur behind the fuse, in px (how far the thread reaches). Defaults to 0.55 of the gap. */
  viscosity?: number;
  /** Alpha ramp slope: how hard the fused edge is. */
  threshold?: number;
  /** Run the fuse at all. Off, the surfaces simply pull apart. */
  gooey?: boolean;
  /** Leave a bead of juice behind when the thread severs. */
  bead?: boolean;
};

export function GooeyNav({
  items,
  value,
  defaultValue = 0,
  onChange,
  variant = "calamansi",
  size = "md",
  separation,
  radius,
  viscosity,
  threshold = 19,
  gooey = true,
  bead = true,
  className,
  ...props
}: GooeyNavProps) {
  const reduced = useReducedMotion() ?? false;
  const filterId = `gooey-nav-${useId().replace(/:/g, "")}`;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);

  const active = value ?? uncontrolled;
  const preset = SIZES[size] ?? SIZES.md;
  const gap = separation ?? preset.separation;
  const corner = radius ?? preset.radius;
  const blur = viscosity ?? gap * LIQUID_VISCOSITY;
  const sever = LIQUID_SEVER * blur;
  const seal = LIQUID_SEAL * corner;
  const pull = gap / 2;
  const palette = VARIANTS[variant] ?? VARIANTS.calamansi;
  const fused = gooey && !reduced;

  // a seam opens either side of the active pill, and nowhere else
  const open = (seam: number) => seam - 1 === active || seam === active;

  return (
    <nav data-variant={variant} className={cn("inline-block", className)} {...props}>
      <FuseFilter id={filterId} blur={blur} threshold={threshold} />
      <ul className="relative flex items-center" style={fused ? { filter: `url(#${filterId})` } : undefined}>
        {items.map((item, index) => {
          const { label, href, icon } = toItem(item);
          const isActive = index === active;
          const shared = {
            "aria-current": isActive ? (href ? ("page" as const) : true) : undefined,
            className: cn(
              "flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0",
              // the label arrives with the pill and leaves the moment it does
              isActive ? "transition-colors duration-[400ms]" : "transition-colors duration-0",
              preset.label,
              isActive ? palette.ink : "text-muted-foreground hover:text-foreground",
            ),
            onClick: () => {
              if (value === undefined) setUncontrolled(index);
              onChange?.(index);
            },
          };
          return (
            <LiquidSegment
              key={`${index}-${label}`}
              seamLeft={open(index)}
              seamRight={open(index + 1)}
              atStart={index === 0}
              atEnd={index === items.length - 1}
              radius={corner}
              pull={pull}
              seal={seal}
              sever={sever}
              bead={bead}
              beadFill={open(index) ? palette.juice : TRAY_INK}
              paint={cn(TRAY, isActive && palette.paint)}
              reduced={reduced}
            >
              {href ? (
                <a href={href} {...shared}>
                  {icon}
                  {label}
                </a>
              ) : (
                <button type="button" {...shared}>
                  {icon}
                  {label}
                </button>
              )}
            </LiquidSegment>
          );
        })}
      </ul>
    </nav>
  );
}
