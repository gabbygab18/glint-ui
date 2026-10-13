"use client";

import { useState } from "react";
import { StretchTabs } from "./stretch-tabs";

export default function Demo(p: Record<string, unknown>) {
  const [view, setView] = useState("Week");
  return (
    <div className="flex flex-col items-center gap-5">
      <StretchTabs defaultValue="Week" {...p} onChange={setView} />
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{view}</span> · arrow keys work too
      </p>
    </div>
  );
}
