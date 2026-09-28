"use client";

import { useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowUp, FileText, Image as ImageIcon, Paperclip, Square, X } from "lucide-react";

export interface PromptBarProps {
  /** Called on send. Return a promise to show the generating state until it settles. */
  onSubmit?: (text: string, files: File[]) => void | Promise<unknown>;
  /** Called when the stop button is pressed while generating. */
  onStop?: () => void;
  /** Force the generating state from outside. */
  generating?: boolean;
  /** Files attached on mount. */
  defaultFiles?: File[];
  placeholder?: string;
  /** The field grows up to this many lines, then scrolls. */
  maxRows?: number;
  /** File input `accept` attribute. */
  accept?: string;
  className?: string;
}

const spring = { type: "spring", stiffness: 500, damping: 30 } as const;
const LINE = 24;

export function PromptBar({
  onSubmit,
  onStop,
  generating = false,
  defaultFiles = [],
  placeholder = "Ask anything…",
  maxRows = 6,
  accept,
  className,
}: PromptBarProps) {
  const id = useId();
  const [text, setText] = useState("");
  const seq = useRef(0);
  const tag = (list: File[]) => list.map((file) => ({ file, id: seq.current++ }));
  const [files, setFiles] = useState(() => defaultFiles.map((file, id) => ({ file, id: -1 - id })));
  const [busy, setBusy] = useState(false);
  const [height, setHeight] = useState(LINE);
  const mirror = useRef<HTMLTextAreaElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const run = useRef(0);
  const isGen = generating || busy;
  const canSend = !isGen && (text.trim() !== "" || files.length > 0);

  // Measure in a hidden twin so the visible field can animate its height.
  useLayoutEffect(() => {
    const m = mirror.current;
    if (m) setHeight(Math.min(Math.max(m.scrollHeight, LINE), LINE * maxRows));
  }, [text, maxRows]);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (isGen) {
      run.current++;
      setBusy(false);
      onStop?.();
      return;
    }
    if (!canSend) return;
    const result = onSubmit?.(text.trim(), files.map((f) => f.file));
    setText("");
    setFiles([]);
    field.current?.focus();
    if (result instanceof Promise) {
      const mine = ++run.current;
      setBusy(true);
      result.finally(() => mine === run.current && setBusy(false));
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) send(e);
    if (e.key === "Backspace" && text === "" && files.length) setFiles((f) => f.slice(0, -1));
  };

  const textClass = "block w-full resize-none bg-transparent px-1 text-[15px] leading-6 outline-none";

  return (
    <MotionConfig reducedMotion="user">
      <form
        onSubmit={send}
        className={`w-full max-w-xl rounded-3xl border border-border bg-card p-2.5 shadow-xl transition-shadow focus-within:ring-[3px] focus-within:ring-ring/40 ${className ?? ""}`}
      >
        <AnimatePresence initial={false}>
          {files.length > 0 && (
            <motion.ul
              key="chips"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-1.5 overflow-hidden px-1"
              aria-label="Attachments"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {files.map(({ file: f, id: key }) => {
                  const Icon = f.type.startsWith("image/") ? ImageIcon : FileText;
                  return (
                    <motion.li
                      layout
                      key={key}
                      initial={{ scale: 0.4, opacity: 0, y: 8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 520, damping: 22 }}
                      className="mb-2 flex max-w-48 items-center gap-1.5 rounded-xl border border-border bg-muted py-1 pl-2 pr-1 text-xs text-foreground"
                    >
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setFiles((all) => all.filter((x) => x.id !== key))}
                        className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-3" aria-hidden />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="relative px-1.5 pt-1">
          <label htmlFor={id} className="sr-only">
            Prompt
          </label>
          <textarea
            ref={mirror}
            aria-hidden
            tabIndex={-1}
            readOnly
            rows={1}
            value={text + "​"}
            className={`${textClass} pointer-events-none invisible absolute inset-x-1.5 top-1 h-0 overflow-hidden`}
          />
          <textarea
            id={id}
            ref={field}
            rows={1}
            value={text}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            style={{ height, overflowY: height >= LINE * maxRows ? "auto" : "hidden", outline: "none" }} // the form shows the focus ring
            className={`${textClass} text-foreground transition-[height] duration-200 ease-out placeholder:text-muted-foreground motion-reduce:transition-none`}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <input
            ref={picker}
            type="file"
            multiple
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              setFiles((f) => [...f, ...tag(picked)]);
              e.target.value = "";
            }}
          />
          <motion.button
            type="button"
            aria-label="Attach files"
            onClick={() => picker.current?.click()}
            whileHover={{ rotate: -18 }}
            whileTap={{ scale: 0.85 }}
            transition={spring}
            className="grid size-9 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Paperclip className="size-[18px]" aria-hidden />
          </motion.button>

          <div className="relative grid size-9 place-items-center">
            <AnimatePresence>
              {isGen && (
                <motion.svg
                  key="ring"
                  aria-hidden
                  viewBox="0 0 44 44"
                  className="pointer-events-none absolute -inset-1 size-11 animate-spin text-primary [animation-duration:900ms] motion-reduce:animate-none"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="2.5" />
                  <path d="M22 2a20 20 0 0 1 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </motion.svg>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              aria-label={isGen ? "Stop generating" : "Send"}
              disabled={!canSend && !isGen}
              initial={false}
              animate={{ borderRadius: isGen ? 10 : 18, scale: isGen ? 0.82 : 1 }}
              whileTap={{ scale: 0.72 }}
              transition={spring}
              className="grid size-9 place-items-center bg-primary text-primary-foreground outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-30"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isGen ? (
                  <motion.span key="stop" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={spring}>
                    <Square className="size-3.5 fill-current" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span key="send" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={spring}>
                    <ArrowUp className="size-[18px]" strokeWidth={2.5} aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
        <span className="sr-only" aria-live="polite">
          {isGen ? "Generating" : ""}
        </span>
      </form>
    </MotionConfig>
  );
}
