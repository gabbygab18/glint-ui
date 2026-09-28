"use client";

import { TaskWidget } from "./task-widget";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full justify-center px-4">
      <div className="w-full max-w-[780px] origin-center scale-[0.78]">
        <TaskWidget weather={{ temperature: "31°" }} {...p} />
      </div>
    </div>
  );
}
