"use client";

import { SensitiveText } from "./sensitive-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="max-w-xl px-6">
      <p className="mb-3 text-sm text-muted-foreground">#book-club · spoilers ahead</p>
      <p className="text-2xl leading-relaxed font-medium text-foreground sm:text-3xl sm:leading-relaxed">
        Turns out the lighthouse keeper was <SensitiveText {...p}>her long-lost brother</SensitiveText> the whole time, and the
        map led to <SensitiveText {...p}>an empty chest</SensitiveText>.
      </p>
    </div>
  );
}
