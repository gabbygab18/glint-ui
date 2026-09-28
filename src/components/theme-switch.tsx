"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
const EVENT = "theme-change";

const read = (): Theme => {
  try {
    return (localStorage.getItem("theme") as Theme) || "system";
  } catch {
    return "system";
  }
};

const apply = (t: Theme) =>
  document.documentElement.classList.toggle(
    "dark",
    t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches),
  );

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  // Follow OS changes while on "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const set = (t: Theme) => {
    try {
      localStorage.setItem("theme", t);
    } catch {}
    apply(t);
    window.dispatchEvent(new Event(EVENT));
  };

  const options = [
    { id: "light", label: "Light theme", Icon: Sun },
    { id: "dark", label: "Dark theme", Icon: Moon },
    { id: "system", label: "System theme", Icon: Monitor },
  ] as const;

  return (
    <div role="radiogroup" aria-label="Theme" className="flex items-center gap-0.5 rounded-full border bg-card p-0.5">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={theme === id}
          aria-label={label}
          onClick={() => set(id)}
          className={`grid size-7 place-items-center rounded-full transition-colors ${
            theme === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
