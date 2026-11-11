"use client";

import { Check, FileUp, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

export interface FileDropProps {
  /** File types for the picker, e.g. "image/*,.pdf". */
  accept?: string;
  multiple?: boolean;
  /** Uploads one file and reports progress from 0 to 1. Without it, files are listed as done. */
  upload?: (file: File, onProgress: (p: number) => void) => Promise<void>;
  /** Called with the files that were added. */
  onFiles?: (files: File[]) => void;
  title?: string;
  hint?: string;
  className?: string;
}

interface Entry {
  id: number;
  file: File;
  progress: number;
  error?: boolean;
}

const css = `
@keyframes file-drop-march { to { stroke-dashoffset: -24 } }
.file-drop-edge { animation: file-drop-march 0.8s linear infinite; animation-play-state: paused }
.file-drop-zone[data-over="true"] .file-drop-edge { animation-play-state: running }
@media (prefers-reduced-motion: reduce) { .file-drop-edge { animation: none } }
`;

const size = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

/**
 * An upload zone that wakes up while a file is dragged over it: the dashed edge
 * starts marching, the icon lifts, and dropped files slide into a list with
 * their own progress bars that finish with a check.
 */
export function FileDrop({
  accept,
  multiple = true,
  upload,
  onFiles,
  title = "Drop files here",
  hint = "or click to browse",
  className,
}: FileDropProps) {
  const [over, setOver] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const nextId = useRef(0);

  const setProgress = (id: number, patch: Partial<Entry>) =>
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const add = (files: File[]) => {
    if (!files.length) return;
    const fresh = (multiple ? files : files.slice(0, 1)).map((file) => ({ id: nextId.current++, file, progress: upload ? 0 : 1 }));
    setEntries((list) => (multiple ? [...list, ...fresh] : fresh));
    onFiles?.(fresh.map((e) => e.file));
    if (upload)
      for (const e of fresh)
        upload(e.file, (p) => setProgress(e.id, { progress: Math.min(1, Math.max(0, p)) })).then(
          () => setProgress(e.id, { progress: 1 }),
          () => setProgress(e.id, { error: true }),
        );
  };

  const drag = (e: DragEvent, delta: number) => {
    e.preventDefault();
    depth.current = Math.max(0, depth.current + delta);
    setOver(depth.current > 0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <style href="file-drop" precedence="default">
        {css}
      </style>
      <div className={cn("grid gap-3", className)}>
        <button
          type="button"
          data-over={over}
          onClick={() => picker.current?.click()}
          onDragEnter={(e) => drag(e, 1)}
          onDragLeave={(e) => drag(e, -1)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            depth.current = 0;
            setOver(false);
            add([...e.dataTransfer.files]);
          }}
          className={cn(
            "file-drop-zone relative grid place-items-center gap-2 rounded-2xl px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            over ? "bg-primary/10" : "bg-muted/40 hover:bg-muted/70",
          )}
        >
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <rect
              className="file-drop-edge"
              x="1"
              y="1"
              style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
              rx="15"
              fill="none"
              stroke={over ? "var(--primary)" : "var(--border)"}
              strokeWidth="1.5"
              strokeDasharray="8 4"
            />
          </svg>
          <motion.span
            className={cn("grid size-11 place-items-center rounded-xl", over ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-sm")}
            animate={over ? { y: -6, scale: 1.08, rotate: -6 } : { y: 0, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.45 }}
          >
            <FileUp className="size-5" />
          </motion.span>
          <span className="text-sm font-semibold text-foreground">{over ? "Release to upload" : title}</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </button>
        <input
          ref={picker}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            add([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />

        <ul className="grid gap-2" aria-live="polite">
          <AnimatePresence initial={false}>
            {entries.map((e) => {
              const done = e.progress >= 1 && !e.error;
              return (
                <motion.li
                  key={e.id}
                  layout
                  className="flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card px-3 py-2.5"
                  initial={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-foreground">{e.file.name}</span>
                      <span className={cn("shrink-0 tabular-nums", e.error ? "text-destructive" : "text-muted-foreground")}>
                        {e.error ? "Failed" : done ? size(e.file.size) : `${Math.round(e.progress * 100)}%`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={cn("h-full origin-left rounded-full", e.error ? "bg-destructive" : done ? "bg-emerald-500" : "bg-primary")}
                        initial={false}
                        animate={{ scaleX: e.error ? 1 : e.progress }}
                        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                      />
                    </div>
                  </div>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {done ? (
                      <motion.span
                        key="done"
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.55, duration: 0.4 }}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <motion.button
                        key="remove"
                        type="button"
                        aria-label={`Remove ${e.file.name}`}
                        onClick={() => setEntries((list) => list.filter((x) => x.id !== e.id))}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        exit={{ scale: 0 }}
                      >
                        <X className="size-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </MotionConfig>
  );
}
