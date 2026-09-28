"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Kbd, KbdGroup } from "./kbd";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-8">
      <KbdGroup separator="+">
        <Kbd {...p} match="mod">⌘</Kbd>
        <Kbd {...p}>K</Kbd>
      </KbdGroup>
      <div className="flex items-end gap-6">
        <div className="grid gap-1.5">
          <div className="flex gap-1.5">
            <Kbd {...p}>Esc</Kbd>
            <Kbd {...p}>Tab</Kbd>
          </div>
          <div className="flex gap-1.5">
            <Kbd {...p}>Shift</Kbd>
            <Kbd {...p} match="space" className="w-32">
              Space
            </Kbd>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <span />
          <Kbd {...p} match="ArrowUp">
            <ArrowUp className="size-3.5" />
            <span className="sr-only">Arrow up</span>
          </Kbd>
          <span />
          <Kbd {...p} match="ArrowLeft">
            <ArrowLeft className="size-3.5" />
            <span className="sr-only">Arrow left</span>
          </Kbd>
          <Kbd {...p} match="ArrowDown">
            <ArrowDown className="size-3.5" />
            <span className="sr-only">Arrow down</span>
          </Kbd>
          <Kbd {...p} match="ArrowRight">
            <ArrowRight className="size-3.5" />
            <span className="sr-only">Arrow right</span>
          </Kbd>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Press <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">K</Kbd>, Space or an arrow key and watch the caps sink.
      </p>
    </div>
  );
}
